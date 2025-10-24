export type ID = string & { readonly brand: unique symbol };

export interface EmailEntry {
	id: ID;
	email: string;
	createdAt: Date;
	referralCode?: string;
	referredBy?: string;
	meta?: Record<string, unknown>;
}

export interface Referral {
	code: string;
	ownerId: ID;
	uses: number;
	bonus?: number;
}

export interface WaitlistConfig {
	referralPrefix?: string;
	maxReferrals?: number;
	rateLimit?: { windowMs: number; max: number };
	emailValidation?: { allowPlus?: boolean; allowSubdomains?: boolean };
}

// biome-ignore lint/suspicious/noExplicitAny: We need to allow any for maximum flexibility since we want to allow any payload.
export interface WaitlistEvent<T = any> {
	type: "join" | "referral" | "remove" | "error";
	payload: T;
	timestamp: Date;
}

export interface WaitlistAdapter {
	create(entry: EmailEntry): Promise<EmailEntry>;
	update(id: ID, patch: Partial<EmailEntry>): Promise<EmailEntry>;
	delete(id: ID): Promise<void>;
	findByEmail(email: string): Promise<EmailEntry | null>;
	findById(id: ID): Promise<EmailEntry | null>;
	list(): Promise<EmailEntry[]>;
	count(): Promise<number>;
}
