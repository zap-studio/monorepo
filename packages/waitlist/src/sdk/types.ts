import type { EventBus } from "../events";
import type {
  Email,
  EmailEntry,
  ReferralLink,
  WaitlistStorageAdapter,
} from "../types";

/** Options for configuring the waitlist */
export type WaitlistOptions = {
  /** The storage adapter to use for the waitlist */
  adapter: WaitlistStorageAdapter;
  /** An optional event bus for handling waitlist events */
  events?: EventBus;
};

/** Input for joining the waitlist */
export type JoinInput = {
  /** The email address of the user */
  email: Email;
  /** An optional referral code used during signup */
  referralCode?: string;
};

/** Result of joining the waitlist */
export type JoinResult = {
  /** The email entry for the user */
  entry: EmailEntry;
  /** An optional referral link for the user */
  referralLink?: ReferralLink;
};
