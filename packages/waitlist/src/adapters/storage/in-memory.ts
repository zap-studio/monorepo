import { computeReferralScore } from "../../referral";
import type {
  Email,
  EmailEntry,
  ReferralCode,
  ReferralLink,
  WaitlistStorageAdapter,
} from "../../types";

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
    for (const entry of this.entries.values()) {
      if (entry.email === email) {
        return entry;
      }
    }
    return await Promise.resolve(null);
  }

  async findByReferralCode(code: ReferralCode): Promise<EmailEntry | null> {
    for (const entry of this.entries.values()) {
      if (entry.referralCode === code) {
        return entry;
      }
    }
    return await Promise.resolve(null);
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

  async getLeaderboard(): Promise<{ email: Email; score: number }[]> {
    const entries = await this.list();
    const referrals = await this.listReferrals();

    const leaderboard = entries.map((entry) => ({
      email: entry.email,
      score: computeReferralScore(entry.email, referrals),
    }));

    leaderboard.sort((a, b) => b.score - a.score);

    return leaderboard;
  }
}
