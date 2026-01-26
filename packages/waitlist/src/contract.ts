import type { Email } from "@zap-studio/validation/email/types";
import type { Leaderboard } from "./leaderboard/types";
import type { JoinInput, JoinResult } from "./types";

/** Waitlist service interface */
export interface WaitlistService {
  /** Join the waitlist */
  join(input: JoinInput): Promise<JoinResult>;

  /** Remove a user from the waitlist */
  leave(email: Email): Promise<void>;

  /** Get the leaderboard */
  getLeaderboard(): Promise<Leaderboard>;

  /** Get a user's current position in the waitlist */
  getPosition(email: Email): Promise<number | null>;
}
