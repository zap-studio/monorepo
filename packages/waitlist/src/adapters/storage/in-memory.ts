import type { Email } from "@zap-studio/validation/email/types";
import { DEFAULT_POSITION_STRATEGY } from "../../constants";
import { calculateScores, sortEntriesByScores } from "../../leaderboard";
import type { Leaderboard, PositionStrategy } from "../../leaderboard/types";
import type { ReferralLink } from "../../referral/types";
import type { EmailEntry, ReferralCode } from "../../types";
import type { WaitlistStorageAdapter } from "./types";

export class InMemoryAdapter implements WaitlistStorageAdapter {
  private readonly entries = new Map<Email, EmailEntry>();
  private readonly referrals = new Map<string, ReferralLink>();

  private getReferralKey(referrer: Email, referee: Email): string {
    return `${referrer}:${referee}`;
  }

  async create(entry: EmailEntry): Promise<EmailEntry> {
    this.entries.set(entry.email, entry);
    return await Promise.resolve(entry);
  }

  async createReferral(link: ReferralLink): Promise<ReferralLink> {
    const key = this.getReferralKey(link.referrer, link.referee);
    this.referrals.set(key, link);
    return await Promise.resolve(link);
  }

  async update(email: Email, patch: Partial<EmailEntry>): Promise<EmailEntry> {
    const existing = this.entries.get(email);
    if (!existing) {
      throw new Error("Entry not found");
    }
    const updated = { ...existing, ...patch };
    this.entries.set(email, updated);
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
    this.referrals.set(referralKey, updated);
    return await Promise.resolve(updated);
  }

  async delete(email: Email): Promise<void> {
    await Promise.resolve(this.entries.delete(email));
  }

  async deleteReferral(key: {
    referrer: Email;
    referee: Email;
  }): Promise<void> {
    const referralKey = this.getReferralKey(key.referrer, key.referee);
    await Promise.resolve(this.referrals.delete(referralKey));
  }

  async findByEmail(email: Email): Promise<EmailEntry | null> {
    return await Promise.resolve(this.entries.get(email) ?? null);
  }

  async findByReferralCode(code: ReferralCode): Promise<EmailEntry | null> {
    return await Promise.resolve(this.entries.get(code) ?? null);
  }

  async getReferralCount(email: Email): Promise<number> {
    let count = 0;
    for (const referral of this.referrals.values()) {
      if (referral.referrer === email) {
        count += 1;
      }
    }
    return await Promise.resolve(count);
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
    const entries = await this.list();
    const referrals = await this.listReferrals();

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
