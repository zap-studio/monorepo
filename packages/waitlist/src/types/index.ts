import type {
  Email,
  EmailValidationConfig,
} from "@zap-studio/validation/email/types";

export type ReferralCode = string;

/** Represents a participant's email entry in the waitlist. */
export interface EmailEntry {
  /** The email address of the participant. */
  email: Email;
  /** The date when the participant joined the waitlist. */
  createdAt: Date;
  /** The unique referral code assigned to the participant. */
  referralCode?: ReferralCode;
  /** The referral code used by the participant to join, if any. */
  referredBy?: ReferralCode;
  /** Additional metadata associated with the participant. */
  meta?: Record<string, unknown>;
}

/** Represents a referral relationship (who referred whom). */
export interface ReferralKey {
  referrer: Email;
  referee: Email;
}

/** A record of an actual referral relationship (who referred whom). */
export interface ReferralLink {
  /** The referrer (owner of the code). */
  referrer: Email;
  /** The referee (the person who joined with the code). */
  referee: Email;
  /** Timestamp of when this referral occurred. */
  createdAt: Date;
}

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

export interface EventPayloadMap {
  join: { email: Email };
  referral: { referrer: Email; referee: Email };
  remove: { email: Email; reason?: string };
  error: { err: unknown; source: keyof EventPayloadMap };
}

export type WaitlistEventType = keyof EventPayloadMap;

/** Represents an event in the waitlist system. */
export interface WaitlistEvent<T = unknown> {
  /** The type of event. */
  type: WaitlistEventType;
  /** The payload associated with the event. */
  payload: T;
  /** The timestamp when the event occurred. */
  timestamp: Date;
}

export interface LeaderboardEntry {
  email: Email;
  score: number;
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
