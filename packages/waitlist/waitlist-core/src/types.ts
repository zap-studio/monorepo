export type ID = string & { readonly brand: unique symbol };

/** Represents a participant's email entry in the waitlist. */
export interface EmailEntry {
	/** The unique ID of the participant. */
	id: ID;
	/** The email address of the participant. */
	email: string;
	/** The date when the participant joined the waitlist. */
	createdAt: Date;
	/** The unique referral code assigned to the participant. */
	referralCode?: string;
	/** The referral code used by the participant to join, if any. */
	referredBy?: string;
	/** Additional metadata associated with the participant. */
	meta?: Record<string, unknown>;
}

/** A referral link created for a participant. */
export interface Referral {
	/** The unique referral code associated with this participant. */
	code: string;
	/** The ID of the participant who owns this referral code. */
	ownerId: ID;
	/** The number of successful joins through this code. */
	uses: number;
}

/** A record of an actual referral relationship (who referred whom). */
export interface ReferralLink {
	/** The referrer (owner of the code). */
	referrerId: ID;
	/** The referee (the person who joined with the code). */
	refereeId: ID;
	/** Timestamp of when this referral occurred. */
	createdAt: Date;
}

/** Represents the configuration options for email validation. */
export type EmailValidationConfig = {
	/** Whether to allow "+" in the local part of the email address. */
	allowPlus?: boolean;
	/** Whether to allow subdomains in the email address. */
	allowSubdomains?: boolean;
};

/** Represents the configuration options for the waitlist. */
export interface WaitlistConfig {
	/** The prefix to use for referral codes. */
	referralPrefix?: string;
	/** The maximum number of referrals a participant can have. */
	maxReferrals?: number;
	/** The rate limit configuration for the waitlist. */
	rateLimit?: { windowMs: number; max: number };
	/** The email validation configuration. */
	emailValidation?: EmailValidationConfig;
}

/** Represents an event in the waitlist system. */
// biome-ignore lint/suspicious/noExplicitAny: We need to allow any for maximum flexibility since we want to allow any payload.
export interface WaitlistEvent<T = any> {
	/** The type of event. */
	type: "join" | "referral" | "remove" | "error";
	/** The payload associated with the event. */
	payload: T;
	/** The timestamp when the event occurred. */
	timestamp: Date;
}

/** Represents the adapter for the waitlist system. */
export interface WaitlistAdapter {
	/** Creates a new email entry in the waitlist. */
	create(entry: EmailEntry): Promise<EmailEntry>;
	/** Updates an existing email entry in the waitlist. */
	update(id: ID, patch: Partial<EmailEntry>): Promise<EmailEntry>;
	/** Deletes an email entry from the waitlist. */
	delete(id: ID): Promise<void>;
	/** Finds an email entry by its email address. */
	findByEmail(email: string): Promise<EmailEntry | null>;
	/** Finds an email entry by its ID. */
	findById(id: ID): Promise<EmailEntry | null>;
	/** Lists all email entries in the waitlist. */
	list(): Promise<EmailEntry[]>;
	/** Counts the total number of email entries in the waitlist. */
	count(): Promise<number>;
}
