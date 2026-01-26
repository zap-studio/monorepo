import { validateEmail } from "@zap-studio/validation/email/standard";
import type { Email } from "@zap-studio/validation/email/types";
import type { WaitlistStorageAdapter } from "./adapters/storage/types";
import {
  DEFAULT_POSITION_STRATEGY,
  DEFAULT_WAITLIST_CONFIG,
} from "./constants";
import type { WaitlistService } from "./contract";
import { EventBus } from "./events";
import { calculatePosition, unhandledStrategy } from "./leaderboard";
import type { Leaderboard, PositionStrategy } from "./leaderboard/types";
import { addReferralCode, createReferralLink } from "./referral";
import type { ReferralKey, ReferralLink } from "./referral/types";
import type {
  EmailEntry,
  JoinInput,
  JoinResult,
  JoinSuccessResult,
  ReferralCode,
  WaitlistConfig,
} from "./types";

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
    this.config = {
      ...DEFAULT_WAITLIST_CONFIG,
      ...config,
    };
  }

  /** Creates a new email entry in the waitlist */
  async create(entry: EmailEntry): Promise<EmailEntry> {
    return await this.adapter.create(entry);
  }

  /** Creates a new referral link in the waitlist */
  async createReferral(link: ReferralLink): Promise<ReferralLink> {
    return await this.adapter.createReferral(link);
  }

  /** Updates an existing email entry in the waitlist */
  async update(id: Email, patch: Partial<EmailEntry>): Promise<EmailEntry> {
    return await this.adapter.update(id, patch);
  }

  /** Updates an existing referral link in the waitlist */
  async updateReferral(
    key: ReferralKey,
    patch: Partial<ReferralLink>
  ): Promise<ReferralLink> {
    return await this.adapter.updateReferral(key, patch);
  }

  /** Deletes an email entry from the waitlist */
  async delete(id: Email): Promise<void> {
    await this.adapter.delete(id);
  }

  /** Deletes a referral link from the waitlist */
  async deleteReferral(key: ReferralKey): Promise<void> {
    await this.adapter.deleteReferral(key);
  }

  /** Finds an email entry by its email address */
  async findByEmail(email: Email): Promise<EmailEntry | null> {
    return await this.adapter.findByEmail(email);
  }

  /** Find a referrer by their referral code */
  async findByReferralCode(code: ReferralCode): Promise<EmailEntry | null> {
    return await this.adapter.findByReferralCode(code);
  }

  /** Get referral count for a specific email */
  async getReferralCount(email: Email): Promise<number> {
    return await this.adapter.getReferralCount(email);
  }

  /** Lists all email entries in the waitlist */
  async list(): Promise<EmailEntry[]> {
    return await this.adapter.list();
  }

  /** List all emails in the waitlist */
  async listEmails(): Promise<Email[]> {
    return await this.adapter.listEmails();
  }

  /** Lists all referral links in the waitlist */
  async listReferrals(): Promise<ReferralLink[]> {
    return await this.adapter.listReferrals();
  }

  /** Counts the total number of email entries in the waitlist */
  async count(): Promise<number> {
    return await this.adapter.count();
  }

  /** Counts the total number of referral links in the waitlist */
  async countReferrals(): Promise<number> {
    return await this.adapter.countReferrals();
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
  async getLeaderboard(): Promise<Leaderboard> {
    const strategy: PositionStrategy =
      this.config?.positionStrategy ?? DEFAULT_POSITION_STRATEGY;
    return await this.adapter.getLeaderboard(strategy);
  }

  /**
   * Get a user's current position in the waitlist
   *
   * @example
   * const server = new WaitlistServer({ adapter: myAdapter });
   * const position = await server.getPosition("user@example.com");
   */
  async getPosition(email: Email): Promise<number | null> {
    const strategy = this.config?.positionStrategy;
    switch (strategy) {
      case "number-of-referrals": {
        const [entries, referrals] = await Promise.all([
          this.adapter.list(),
          this.adapter.listReferrals(),
        ]);
        return calculatePosition(entries, email, {
          strategy,
          referrals,
        });
      }
      case "creation-date": {
        const entries = await this.adapter.list();
        return calculatePosition(entries, email, { strategy });
      }
      default:
        unhandledStrategy(strategy);
    }
  }
}
