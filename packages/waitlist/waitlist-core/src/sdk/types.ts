import type { WaitlistStorageAdapter, ReferralLink, Email } from "../types";
import type { EventBus } from "../events";
import type { EmailEntry } from "../types";

/** Options for configuring the waitlist */
export interface WaitlistOptions {
	/** The storage adapter to use for the waitlist */
	adapter: WaitlistStorageAdapter;
	/** An optional event bus for handling waitlist events */
	events?: EventBus;
}

/** Input for joining the waitlist */
export interface JoinInput {
	/** The email address of the user */
	email: Email;
	/** An optional referral code used during signup */
	referralCode?: string;
}

/** Result of joining the waitlist */
export interface JoinResult {
	/** The email entry for the user */
	entry: EmailEntry;
	/** An optional referral link for the user */
	referralLink?: ReferralLink;
}
