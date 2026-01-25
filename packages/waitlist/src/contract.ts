import type { Email } from "@zap-studio/validation/email/types";
import type { JoinInput, JoinResult, LeaderboardEntry } from "./types";

/** Waitlist service interface */
export interface WaitlistService {
  /** Join the waitlist */
  join(input: JoinInput): Promise<JoinResult>;

  /** Remove a user from the waitlist */
  leave(email: Email): Promise<void>;

  /** Get the leaderboard */
  getLeaderboard(): Promise<LeaderboardEntry[]>;

  /** Get a user's current position in the waitlist */
  getPosition(email: Email): Promise<number | undefined>;
}
