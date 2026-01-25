import type { Email } from "@zap-studio/validation/email/types";

/** Represents a referral relationship (who referred whom). */
export interface ReferralKey {
  /** The email address of the person who referred someone. */
  referrer: Email;

  /** The email address of the person who was referred. */
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
