import { computeReferralScore } from "@zap-studio/waitlist-core/referral";
import type {
	Email,
	EmailEntry,
	ReferralCode,
	ReferralLink,
	WaitlistStorageAdapter,
} from "@zap-studio/waitlist-core/types";

export class InMemoryAdapter implements WaitlistStorageAdapter {
	private entries = new Map<Email, EmailEntry>();
	private referrals = new Map<
		{ referrer: Email; referee: Email },
		ReferralLink
	>();

	async create(entry: EmailEntry): Promise<EmailEntry> {
		this.entries.set(entry.email, entry);
		return entry;
	}

	async createReferral(link: ReferralLink): Promise<ReferralLink> {
		this.referrals.set(
			{ referrer: link.referrer, referee: link.referee },
			link,
		);
		return link;
	}

	async update(email: Email, patch: Partial<EmailEntry>): Promise<EmailEntry> {
		const existing = this.entries.get(email);
		if (!existing) throw new Error("Entry not found");
		const updated = { ...existing, ...patch };
		this.entries.set(email, updated);
		return updated;
	}

	async updateReferral(
		key: { referrer: Email; referee: Email },
		patch: Partial<ReferralLink>,
	): Promise<ReferralLink> {
		const existing = this.referrals.get(key);
		if (!existing) throw new Error("Referral not found");
		const updated = { ...existing, ...patch };
		this.referrals.set(key, updated);
		return updated;
	}

	async delete(email: Email): Promise<void> {
		this.entries.delete(email);
	}

	async deleteReferral(key: {
		referrer: Email;
		referee: Email;
	}): Promise<void> {
		this.referrals.delete(key);
	}

	async findByEmail(email: Email): Promise<EmailEntry | null> {
		for (const entry of this.entries.values()) {
			if (entry.email === email) return entry;
		}
		return null;
	}

	async findByReferralCode(code: ReferralCode): Promise<EmailEntry | null> {
		for (const entry of this.entries.values()) {
			if (entry.referralCode === code) return entry;
		}
		return null;
	}

	async getReferralCount(email: Email): Promise<number> {
		let count = 0;
		for (const referral of this.referrals.values()) {
			if (referral.referrer === email) {
				count++;
			}
		}
		return count;
	}

	async list(): Promise<EmailEntry[]> {
		return Array.from(this.entries.values());
	}

	async listEmails(): Promise<Email[]> {
		return Array.from(this.entries.keys());
	}

	async listReferrals(): Promise<ReferralLink[]> {
		return Array.from(this.referrals.values());
	}

	async count(): Promise<number> {
		return this.entries.size;
	}

	async countReferrals(): Promise<number> {
		return this.referrals.size;
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
