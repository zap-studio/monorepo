import type {
	EmailEntry,
	Email,
	WaitlistStorageAdapter,
} from "@zap-studio/waitlist-core/types";

export class InMemoryAdapter implements WaitlistStorageAdapter {
	private entries = new Map<Email, EmailEntry>();
	private referrals = new Map<string, number>();

	async create(entry: EmailEntry): Promise<EmailEntry> {
		this.entries.set(entry.email, entry);
		if (entry.referralCode) this.referrals.set(entry.referralCode, 0);
		return entry;
	}

	async update(email: Email, patch: Partial<EmailEntry>): Promise<EmailEntry> {
		const existing = this.entries.get(email);
		if (!existing) throw new Error("Entry not found");
		const updated = { ...existing, ...patch };
		this.entries.set(email, updated);
		return updated;
	}

	async delete(email: Email): Promise<void> {
		this.entries.delete(email);
	}

	async findByEmail(email: Email): Promise<EmailEntry | null> {
		for (const entry of this.entries.values()) {
			if (entry.email === email) return entry;
		}
		return null;
	}

	async findById(id: Email): Promise<EmailEntry | null> {
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
