import type { Email } from "@zap-studio/validation/email/types";
import type { ReferralLink } from "../referral/types";

/** The strategy used to calculate the position of a participant in the waitlist. */
export type PositionStrategy = "creation-date" | "number-of-referrals";

/**
 * Represents an entry in the leaderboard.
 */
export interface LeaderboardEntry {
  /** The email address of the participant. */
  email: Email;

  /** The score of the participant. */
  score: number;
}

/** The options for calculating the position of a participant in the waitlist. */
export interface CalculatePositionOptions {
  /** Referral links required for number-of-referrals strategy. */
  referrals?: ReferralLink[];
  /** The strategy used to calculate the position. */
  strategy?: PositionStrategy;
}

/** The options for calculating the score of a participant in the waitlist. */
export interface CalculateScoreOptions {
  /** The strategy used to calculate the score. */
  strategy?: PositionStrategy;
}

/** The leaderboard entries returned by the waitlist. */
export type Leaderboard = LeaderboardEntry[];
