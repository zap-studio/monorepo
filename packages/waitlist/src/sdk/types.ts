import type { Email } from "@zap-studio/validation/email/types";
import type { EventBus } from "../events";
import type {
  EmailEntry,
  ReferralLink,
  WaitlistConfig,
  WaitlistStorageAdapter,
} from "../types";

/** Options for configuring the waitlist */
export interface WaitlistOptions {
  /** The storage adapter to use for the waitlist */
  adapter: WaitlistStorageAdapter;
  /** An optional event bus for handling waitlist events */
  events?: EventBus;
  /** Optional configuration for waitlist behavior */
  config?: WaitlistConfig;
}

/** Input for joining the waitlist */
export interface JoinInput {
  /** The email address of the user */
  email: Email;
  /** An optional referral code used during signup */
  referralCode?: string;
}

/** Possible reasons why joining the waitlist can fail */
export type JoinErrorReason = "invalid-email";

/** Error result when joining the waitlist fails */
export interface JoinErrorResult {
  /** Whether the join operation was successful */
  ok: false;
  /** Machine-readable error reason */
  reason: JoinErrorReason;
  /** Optional human-readable error message */
  message?: string;
}

/** Successful result of joining the waitlist */
export interface JoinSuccessResult {
  ok: true;
  /** The email entry for the user */
  entry: EmailEntry;
  /** An optional referral link for the user */
  referralLink?: ReferralLink;
}

/** Result of joining the waitlist */
export type JoinResult = JoinSuccessResult | JoinErrorResult;
