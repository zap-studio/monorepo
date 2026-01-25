import type { PositionStrategy } from "./leaderboard/types";
import type { WaitlistConfig } from "./types";

export const DEFAULT_API_PREFIX = "/api/waitlist";
export const DEFAULT_POSITION_STRATEGY: PositionStrategy = "creation-date";
export const DEFAULT_REFERRAL_CODE_LENGTH = 6;

export const DEFAULT_WAITLIST_CONFIG: WaitlistConfig = {
  positionStrategy: DEFAULT_POSITION_STRATEGY,
  referralCodeLength: DEFAULT_REFERRAL_CODE_LENGTH,
};
