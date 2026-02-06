import type { Email } from "@zap-studio/validation/email/types";
import { DEFAULT_POSITION_STRATEGY } from "../../constants";
import { calculateScores, sortEntriesByScores } from "../../leaderboard";
import type { Leaderboard, PositionStrategy } from "../../leaderboard/types";
import type { ReferralLink } from "../../referral/types";
import type { EmailEntry, ReferralCode } from "../../types";
import type { WaitlistStorageAdapter } from "./types";

export class InMemoryAdapter implements WaitlistStorageAdapter {
  private readonly entries: Map<Email, EmailEntry>;
  private readonly referrals: Map<string, ReferralLink>;
  private readonly referralIndex: Map<ReferralCode, EmailEntry>;
  private readonly referralCountIndex: Map<Email, number>;

  constructor() {
    this.entries = new Map();
    this.referrals = new Map();
    this.referralIndex = new Map();
    this.referralCountIndex = new Map();
  }

  private getReferralKey(referrer: Email, referee: Email): string {
    return `${referrer}:${referee}`;
  }

  private updateReferralIndex(entry: EmailEntry): void {
    if (!entry.referralCode) {
      return;
    }
    this.referralIndex.set(entry.referralCode, entry);
  }

  private removeReferralIndex(entry: EmailEntry): void {
    if (!entry.referralCode) {
      return;
    }
    this.referralIndex.delete(entry.referralCode);
  }

  private incrementReferralCount(email: Email): void {
    const current = this.referralCountIndex.get(email) ?? 0;
    this.referralCountIndex.set(email, current + 1);
  }

  private decrementReferralCount(email: Email): void {
    const current = this.referralCountIndex.get(email);
    if (current === undefined) {
      return;
    }
    const next = current - 1;
    if (next <= 0) {
      this.referralCountIndex.delete(email);
      return;
    }
    this.referralCountIndex.set(email, next);
  }

  async create(entry: EmailEntry): Promise<EmailEntry> {
    if (this.entries.has(entry.email)) {
      throw new Error("Entry already exists");
    }
    this.entries.set(entry.email, entry);
    this.updateReferralIndex(entry);
    return await Promise.resolve(entry);
  }

  async createReferral(link: ReferralLink): Promise<ReferralLink> {
    const key = this.getReferralKey(link.referrer, link.referee);
    if (this.referrals.has(key)) {
      throw new Error("Referral already exists");
    }
    this.referrals.set(key, link);
    this.incrementReferralCount(link.referrer);
    return await Promise.resolve(link);
  }

  async update(email: Email, patch: Partial<EmailEntry>): Promise<EmailEntry> {
    const existing = this.entries.get(email);
    if (!existing) {
      throw new Error("Entry not found");
    }
    const updated = { ...existing, ...patch };
    this.entries.set(email, updated);
    if (
      existing.referralCode &&
      existing.referralCode !== updated.referralCode
    ) {
      this.removeReferralIndex(existing);
    }
    this.updateReferralIndex(updated);
    return await Promise.resolve(updated);
  }

  async updateReferral(
    key: { referrer: Email; referee: Email },
    patch: Partial<ReferralLink>
  ): Promise<ReferralLink> {
    const referralKey = this.getReferralKey(key.referrer, key.referee);
    const existing = this.referrals.get(referralKey);
    if (!existing) {
      throw new Error("Referral not found");
    }
    const updated = { ...existing, ...patch };
    if (
      existing.referrer !== updated.referrer ||
      existing.referee !== updated.referee
    ) {
      const updatedKey = this.getReferralKey(updated.referrer, updated.referee);
      const collision = this.referrals.get(updatedKey);
      if (collision && collision !== existing) {
        throw new Error(
          `Referral key collision for ${updatedKey}; refusing to overwrite existing referral`
        );
      }
      this.referrals.delete(referralKey);
      this.referrals.set(updatedKey, updated);
    } else {
      this.referrals.set(referralKey, updated);
    }
    if (existing.referrer !== updated.referrer) {
      this.decrementReferralCount(existing.referrer);
      this.incrementReferralCount(updated.referrer);
    }
    return await Promise.resolve(updated);
  }

  async delete(email: Email): Promise<void> {
    const existing = this.entries.get(email);
    if (existing) {
      this.removeReferralIndex(existing);
    }
    await Promise.resolve(this.entries.delete(email));
  }

  async deleteReferral(key: {
    referrer: Email;
    referee: Email;
  }): Promise<void> {
    const referralKey = this.getReferralKey(key.referrer, key.referee);
    const existing = this.referrals.get(referralKey);
    if (existing) {
      this.decrementReferralCount(existing.referrer);
    }
    await Promise.resolve(this.referrals.delete(referralKey));
  }

  async findByEmail(email: Email): Promise<EmailEntry | null> {
    return await Promise.resolve(this.entries.get(email) ?? null);
  }

  async findByReferralCode(code: ReferralCode): Promise<EmailEntry | null> {
    return await Promise.resolve(this.referralIndex.get(code) ?? null);
  }

  async getReferralCount(email: Email): Promise<number> {
    return await Promise.resolve(this.referralCountIndex.get(email) ?? 0);
  }

  async list(): Promise<EmailEntry[]> {
    return await Promise.resolve(Array.from(this.entries.values()));
  }

  async listEmails(): Promise<Email[]> {
    return await Promise.resolve(Array.from(this.entries.keys()));
  }

  async listReferrals(): Promise<ReferralLink[]> {
    return await Promise.resolve(Array.from(this.referrals.values()));
  }

  async count(): Promise<number> {
    return await Promise.resolve(this.entries.size);
  }

  async countReferrals(): Promise<number> {
    return await Promise.resolve(this.referrals.size);
  }

  async getLeaderboard(
    positionStrategy: PositionStrategy = DEFAULT_POSITION_STRATEGY
  ): Promise<Leaderboard> {
    const [entries, referrals] = await Promise.all([
      this.list(),
      this.listReferrals(),
    ]);

    const scores = calculateScores(entries, referrals, {
      strategy: positionStrategy,
    });
    const sortedEntries = sortEntriesByScores(entries, scores);

    return sortedEntries.map((entry) => ({
      email: entry.email,
      score: scores.get(entry.email) ?? 0,
    }));
  }
}
