import type { EmailEntry, ID } from "@zap-studio/waitlist-core/types";

export interface WaitlistAdapter {
	create(entry: EmailEntry): Promise<EmailEntry>;
	update(id: ID, patch: Partial<EmailEntry>): Promise<EmailEntry>;
	delete(id: ID): Promise<void>;
	findByEmail(email: string): Promise<EmailEntry | null>;
	findById(id: ID): Promise<EmailEntry | null>;
	list(): Promise<EmailEntry[]>;
	count(): Promise<number>;

	/** Optional: increment referral usage counter */
	incrementReferral?(code: string, delta?: number): Promise<number>;
}
