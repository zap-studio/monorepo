import type { ReferralLink } from "../referral/types";
import type { PositionStrategy } from "../types";

/** The options for calculating the position of a participant in the waitlist. */
export interface CalculatePositionOptions {
  /** The strategy used to calculate the position. */
  strategy?: PositionStrategy;

  /** Referral links required for number-of-referrals strategy. */
  referrals?: ReferralLink[];
}

/** The options for calculating the score of a participant in the waitlist. */
export interface CalculateScoreOptions {
  /** The strategy used to calculate the score. */
  strategy?: PositionStrategy;
}
