import type { EmailEntry, ID } from "@zap-studio/waitlist-core/types";
import type { WaitlistAdapter } from "./types";

export class InMemoryAdapter implements WaitlistAdapter {
	private entries = new Map<ID, EmailEntry>();
	private referrals = new Map<string, number>();

	async create(entry: EmailEntry): Promise<EmailEntry> {
		this.entries.set(entry.id, entry);
		if (entry.referralCode) this.referrals.set(entry.referralCode, 0);
		return entry;
	}

	async update(id: ID, patch: Partial<EmailEntry>): Promise<EmailEntry> {
		const existing = this.entries.get(id);
		if (!existing) throw new Error("Entry not found");
		const updated = { ...existing, ...patch };
		this.entries.set(id, updated);
		return updated;
	}

	async delete(id: ID): Promise<void> {
		this.entries.delete(id);
	}

	async findByEmail(email: string): Promise<EmailEntry | null> {
		for (const entry of this.entries.values()) {
			if (entry.email === email) return entry;
		}
		return null;
	}

	async findById(id: ID): Promise<EmailEntry | null> {
		return this.entries.get(id) ?? null;
	}

	async list(): Promise<EmailEntry[]> {
		return Array.from(this.entries.values());
	}

	async count(): Promise<number> {
		return this.entries.size;
	}

	async incrementReferral(code: string, delta = 1): Promise<number> {
		const current = this.referrals.get(code) ?? 0;
		const next = current + delta;
		this.referrals.set(code, next);
		return next;
	}
}
