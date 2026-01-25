import { validateEmail } from "@zap-studio/validation/email/standard";
import type { Email } from "@zap-studio/validation/email/types";
import type { WaitlistStorageAdapter } from "./adapters/storage/types";
import type { WaitlistService } from "./contract";
import { EventBus } from "./events";
import {
  addReferralCode,
  computeReferralScore,
  createReferralLink,
} from "./referral";
import type { ReferralLink } from "./referral/types";
import type {
  EmailEntry,
  JoinInput,
  JoinResult,
  JoinSuccessResult,
  LeaderboardEntry,
  WaitlistConfig,
} from "./types";
import { calculatePosition } from "./utils";

/** Options for configuring the waitlist server */
export interface WaitlistServerOptions {
  /** The storage adapter to use for the waitlist */
  adapter: WaitlistStorageAdapter;

  /** An optional event bus for handling waitlist events */
  events?: EventBus;

  /** Optional configuration for waitlist behavior */
  config?: WaitlistConfig;
}

export class WaitlistServer implements WaitlistService {
  /** The storage adapter for the waitlist */
  protected adapter: WaitlistStorageAdapter;
  /** The event bus for handling waitlist events */
  protected events: EventBus;
  /** Optional configuration for waitlist behavior */
  protected config?: WaitlistConfig;

  /** Create a new waitlist server instance */
  constructor({ adapter, events, config }: WaitlistServerOptions) {
    this.adapter = adapter;
    this.events = events ?? new EventBus();
    this.config = config;
  }

  /**
   * Join the waitlist with an email and optional referral code
   *
   * @example
   * const server = new WaitlistServer({ adapter: myAdapter });
   * const result = await server.join({ email: "user@example.com", referralCode: "REF-123" });
   */
  async join(input: JoinInput): Promise<JoinResult> {
    const { email, referralCode } = input;

    const validationResult = validateEmail(email, this.config?.emailValidation);
    if (!validationResult.valid) {
      return {
        ok: false,
        reason: "invalid-email",
        message: validationResult.error,
      };
    }

    // Check if user already exists
    const existing = await this.adapter.findByEmail(email);
    if (existing) {
      const result: JoinSuccessResult = { ok: true, entry: existing };
      return result;
    }

    // Create new entry
    const newEntry: EmailEntry = {
      email,
      createdAt: new Date(),
    };

    // Add a unique referral code to the new entry
    const entryWithCode = addReferralCode(
      newEntry,
      this.config?.referralCodeLength
    );

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

        const result: JoinSuccessResult = {
          ok: true,
          entry: entryWithReferral,
          referralLink,
        };
        return result;
      }
    }

    // No valid referral code - just create the entry
    await this.adapter.create(entryWithCode);
    await this.events.emit("join", { email });

    const result: JoinSuccessResult = { ok: true, entry: entryWithCode };
    return result;
  }

  /**
   * Leave the waitlist by email
   *
   * @example
   * const server = new WaitlistServer({ adapter: myAdapter });
   * await server.leave("user@example.com");
   */
  async leave(email: Email): Promise<void> {
    await this.adapter.delete(email);
    await this.events.emit("leave", { email });
  }

  /**
   * Get leaderboard (sorted by referral score)
   *
   * @example
   * const server = new WaitlistServer({ adapter: myAdapter });
   * const leaderboard = await server.getLeaderboard();
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

  /**
   * Get a user's current position in the waitlist
   *
   * @example
   * const server = new WaitlistServer({ adapter: myAdapter });
   * const position = await server.getPosition("user@example.com");
   */
  async getPosition(email: Email): Promise<number | undefined> {
    const entries = await this.adapter.list();
    return calculatePosition(entries, email);
  }
}
