import type z from "zod";
import type { EmailSchema } from "../core/schemas";

export type Email = z.infer<typeof EmailSchema>;

/** Represents a participant's email entry in the waitlist. */
export interface EmailEntry {
	/** The email address of the participant. */
	email: Email;
	/** The date when the participant joined the waitlist. */
	createdAt: Date;
	/** The unique referral code assigned to the participant. */
	referralCode?: string;
	/** The referral code used by the participant to join, if any. */
	referredBy?: string;
	/** Additional metadata associated with the participant. */
	meta?: Record<string, unknown>;
}

/** A record of an actual referral relationship (who referred whom). */
export interface ReferralLink {
	/** The referrer (owner of the code). */
	referrerId: Email;
	/** The referee (the person who joined with the code). */
	refereeId: Email;
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
	/** The length of the referral codes. */
	referralCodeLength?: number;
	/** The rate limit configuration for the waitlist. */
	rateLimit?: { windowMs: number; max: number };
	/** The email validation configuration. */
	emailValidation?: EmailValidationConfig;
}

export type EventPayloadMap = {
	join: { email: Email };
	referral: { referrerId: Email; refereeId: Email };
	remove: { email: Email; reason?: string };
	error: { err: unknown; source: keyof EventPayloadMap };
};

export type WaitlistEventType = keyof EventPayloadMap;

/** Represents an event in the waitlist system. */
// biome-ignore lint/suspicious/noExplicitAny: We need to allow any for maximum flexibility since we want to allow any payload.
export interface WaitlistEvent<T = any> {
	/** The type of event. */
	type: WaitlistEventType;
	/** The payload associated with the event. */
	payload: T;
	/** The timestamp when the event occurred. */
	timestamp: Date;
}

/** Represents the adapter for the waitlist system. */
export interface WaitlistStorageAdapter {
	/** Creates a new email entry in the waitlist. */
	create(entry: EmailEntry): Promise<EmailEntry>;
	/** Updates an existing email entry in the waitlist. */
	update(id: Email, patch: Partial<EmailEntry>): Promise<EmailEntry>;
	/** Deletes an email entry from the waitlist. */
	delete(id: Email): Promise<void>;
	/** Finds an email entry by its email address. */
	findByEmail(email: Email): Promise<EmailEntry | null>;
	/** Finds an email entry by its ID. */
	findById(id: Email): Promise<EmailEntry | null>;
	/** Lists all email entries in the waitlist. */
	list(): Promise<EmailEntry[]>;
	/** Counts the total number of email entries in the waitlist. */
	count(): Promise<number>;

	/** Optional: increment referral usage counter */
	incrementReferral?(code: string, delta?: number): Promise<number>;
}
