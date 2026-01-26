import type {
  Email,
  EmailValidationConfig,
} from "@zap-studio/validation/email/types";
import type { PositionStrategy } from "../leaderboard/types";
import type { ReferralLink } from "../referral/types";

/** The referral code */
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

/** Represents the configuration options for the waitlist. */
export interface WaitlistConfig {
  /** The prefix to use for referral codes. */
  referralPrefix?: string;

  /** The maximum number of referrals a participant can have. */
  maxReferrals?: number;

  /** The length of the referral codes. */
  referralCodeLength?: number;

  /** Strategy used to compute positions and leaderboard ordering. */
  positionStrategy?: PositionStrategy;

  /** The email validation configuration. */
  emailValidation?: EmailValidationConfig;
}

/** Input for joining the waitlist */
export interface JoinInput {
  /** The email address of the user */
  email: Email;

  /** An optional referral code used during signup */
  referralCode?: ReferralCode;
}

/** Possible reasons why joining the waitlist can fail */
export type JoinErrorReason = "invalid-email" | "already-registered";

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

/** Represents the payloads for waitlist events. */
export interface WaitlistEventPayloadMap {
  /** Represents the payload of a join event */
  join: { email: Email };

  /** Represents the payload of a referral event */
  referral: { referrer: Email; referee: Email };

  /** Represents the payload of a leave event */
  leave: { email: Email; reason?: string };

  /** Represents the payload of an error event */
  error: { err: unknown; source: keyof WaitlistEventPayloadMap };
}

/** Represents the type of an event in the waitlist system */
export type WaitlistEventType = keyof WaitlistEventPayloadMap;
