import type { Email } from "@zap-studio/validation/email/types";
import type { ReferralKey, ReferralLink } from "../../referral/types";
import type {
  EmailEntry,
  LeaderboardEntry,
  PositionStrategy,
  ReferralCode,
} from "../../types";

/** Represents the adapter for the waitlist system */
export interface WaitlistStorageAdapter {
  /** Creates a new email entry in the waitlist */
  create(entry: EmailEntry): Promise<EmailEntry>;

  /** Creates a new referral link in the waitlist */
  createReferral(link: ReferralLink): Promise<ReferralLink>;

  /** Updates an existing email entry in the waitlist */
  update(id: Email, patch: Partial<EmailEntry>): Promise<EmailEntry>;

  /** Updates an existing referral link in the waitlist */
  updateReferral(
    key: ReferralKey,
    patch: Partial<ReferralLink>
  ): Promise<ReferralLink>;

  /** Deletes an email entry from the waitlist */
  delete(id: Email): Promise<void>;

  /** Deletes a referral link from the waitlist */
  deleteReferral(key: ReferralKey): Promise<void>;

  /** Finds an email entry by its email address */
  findByEmail(email: Email): Promise<EmailEntry | null>;

  /** Find a referrer by their referral code */
  findByReferralCode(code: ReferralCode): Promise<EmailEntry | null>;

  /** Get referral count for a specific email */
  getReferralCount(email: Email): Promise<number>;

  /** Lists all email entries in the waitlist */
  list(): Promise<EmailEntry[]>;

  /** List all emails in the waitlist */
  listEmails(): Promise<Email[]>;

  /** Lists all referral links in the waitlist */
  listReferrals(): Promise<ReferralLink[]>;

  /** Counts the total number of email entries in the waitlist */
  count(): Promise<number>;

  /** Counts the total number of referral links in the waitlist */
  countReferrals(): Promise<number>;

  /** Get leaderboard */
  getLeaderboard(
    positionStrategy: PositionStrategy
  ): Promise<LeaderboardEntry[]>;
}
