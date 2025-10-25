import type { EmailEntry, Email } from "@zap-studio/waitlist-core/types";

export interface WaitlistAdapter {
	create(entry: EmailEntry): Promise<EmailEntry>;
	update(email: Email, patch: Partial<EmailEntry>): Promise<EmailEntry>;
	delete(email: Email): Promise<void>;
	findByEmail(email: Email): Promise<EmailEntry | null>;
	findById(email: Email): Promise<EmailEntry | null>;
	list(): Promise<EmailEntry[]>;
	count(): Promise<number>;

	/** Optional: increment referral usage counter */
	incrementReferral?(code: string, delta?: number): Promise<number>;
}
