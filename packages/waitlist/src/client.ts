import type { LeaderboardEntry } from "./types";

/** Options for the WaitlistClient */
export type WaitlistClientOptions = {
  /** The base URL for the API */
  baseUrl: string;
};

export class WaitlistClient {
  /** The base URL for the API */
  baseUrl: string;

  /**
   * Creates an instance of WaitlistClient.
   *
   * @example
   * const client = new WaitlistClient({ baseUrl: "http://localhost:3000" });
   */
  constructor({ baseUrl }: WaitlistClientOptions) {
    this.baseUrl = baseUrl;
  }

  /**
   * Join the waitlist with an email and optional referral code
   *
   * @example
   * const waitlistClient = new WaitlistClient({ baseUrl: "http://localhost:3000" });
   * const result = await waitlistClient.join("user@example.com", "REF-123");
   */
  async join(email: string, referralCode?: string): Promise<void> {
    const res = await fetch(`${this.baseUrl}/api/waitlist/join`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, referralCode }),
    });
    if (!res.ok) {
      throw new Error("Failed to join waitlist", { cause: res });
    }
    return res.json();
  }

  /**
   * Get the waitlist leaderboard
   *
   * @example
   * const waitlistClient = new WaitlistClient({ baseUrl: "http://localhost:3000" });
   * const leaderboard = await waitlistClient.getLeaderboard();
   */
  async getLeaderboard(): Promise<LeaderboardEntry[]> {
    const res = await fetch(`${this.baseUrl}/api/waitlist/leaderboard`);
    if (!res.ok) {
      throw new Error("Failed to fetch leaderboard", { cause: res });
    }
    return res.json();
  }
}
