import { EventBus } from "../events";
import {
  addReferralCode,
  computeReferralScore,
  createReferralLink,
} from "../referral";
import type {
  Email,
  EmailEntry,
  LeaderboardEntry,
  ReferralLink,
  WaitlistStorageAdapter,
} from "../types";
import type { JoinInput, JoinResult, WaitlistOptions } from "./types";

/** Base class for the waitlist SDK */
export class BaseWaitlistSDK {
  /** The storage adapter for the waitlist */
  protected adapter: WaitlistStorageAdapter;
  /** The event bus for handling waitlist events */
  protected events: EventBus;

  /** Create a new waitlist SDK instance */
  constructor({ adapter, events }: WaitlistOptions) {
    this.adapter = adapter;
    this.events = events ?? new EventBus();
  }

  /**
   * Join the waitlist with an email and optional referral code
   *
   * @example
   * const sdk = new BaseWaitlistSDK({ adapter: myAdapter });
   * const result = await sdk.join({ email: "user@example.com", referralCode: "REF-123" });
   */
  async join(input: JoinInput): Promise<JoinResult> {
    const { email, referralCode } = input;

    // Check if user already exists
    const existing = await this.adapter.findByEmail(email);
    if (existing) {
      return { entry: existing };
    }

    // Create new entry
    const newEntry: EmailEntry = {
      email,
      createdAt: new Date(),
    };

    // Add a unique referral code to the new entry
    const entryWithCode = addReferralCode(newEntry);

    // Track referral if a code was provided
    let referralLink: ReferralLink | undefined;
    if (referralCode) {
      // Find the referrer by their referral code
      const referrer = await this.adapter.findByReferralCode(referralCode);

      if (referrer) {
        // Store entry with referredBy field
        const entryWithReferral: EmailEntry = {
          ...entryWithCode,
          referredBy: referralCode,
        };

        // Create the entry
        await this.adapter.create(entryWithReferral);

        // Store the referral link
        referralLink = createReferralLink(referrer.email, email);
        await this.adapter.createReferral(referralLink);

        // Emit events
        await this.events.emit("join", { email });
        await this.events.emit("referral", {
          referrer: referrer.email,
          referee: email,
        });

        return { entry: entryWithReferral, referralLink };
      }
    }

    // No valid referral code - just create the entry
    await this.adapter.create(entryWithCode);
    await this.events.emit("join", { email });

    return { entry: entryWithCode };
  }

  /**
   * Remove a user by email
   *
   * @example
   * const sdk = new BaseWaitlistSDK({ adapter: myAdapter });
   * await sdk.remove("user@example.com");
   */
  async remove(email: Email): Promise<void> {
    await this.adapter.delete(email);
    await this.events.emit("remove", { email });
  }

  /**
   * Get leaderboard (sorted by referral score)
   *
   * @example
   * const sdk = new BaseWaitlistSDK({ adapter: myAdapter });
   * const leaderboard = await sdk.getLeaderboard();
   */
  async getLeaderboard(): Promise<LeaderboardEntry[]> {
    if (this.adapter.getLeaderboard) {
      return this.adapter.getLeaderboard();
    }

    const [emails, referrals] = await Promise.all([
      this.adapter.listEmails(),
      this.adapter.listReferrals(),
    ]);

    return emails
      .map((email) => ({
        email,
        score: computeReferralScore(email, referrals),
      }))
      .sort((a, b) => b.score - a.score);
  }
}
