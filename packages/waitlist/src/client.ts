import { createFetch } from "@zap-studio/fetch";
import type { Email } from "@zap-studio/validation/email/types";
import { DEFAULT_API_PREFIX } from "./constants";
import type { WaitlistService } from "./contract";
import type { Leaderboard } from "./leaderboard/types";
import {
  EmptyResponseSchema,
  JoinResultSchema,
  LeaderboardResponseSchema,
} from "./schemas";
import type { JoinInput, JoinResult } from "./types";

const TrailingSlashRegex = /\/$/;

/** Options for the WaitlistClient */
export interface WaitlistClientOptions {
  /** The base URL for the API */
  baseUrl: string;
  /** Optional API prefix for waitlist routes */
  prefix?: string;
}

export class WaitlistClient implements WaitlistService {
  /** The base URL for the API */
  baseUrl: string;

  /** The configured fetch instance */
  private readonly api: ReturnType<typeof createFetch>["api"];

  /** The API prefix for waitlist routes */
  private readonly prefix: string;

  /**
   * Creates an instance of WaitlistClient.
   *
   * @example
   * const client = new WaitlistClient({ baseUrl: "http://localhost:3000" });
   */
  constructor({ baseUrl, prefix }: WaitlistClientOptions) {
    this.baseUrl = baseUrl;
    const normalizedPrefix = prefix ?? DEFAULT_API_PREFIX;
    const withLeadingSlash = normalizedPrefix.startsWith("/")
      ? normalizedPrefix
      : `/${normalizedPrefix}`;
    this.prefix = withLeadingSlash.replace(TrailingSlashRegex, "");

    const { api } = createFetch({
      baseURL: baseUrl,
      headers: { "Content-Type": "application/json" },
    });

    this.api = api;
  }

  /**
   * Join the waitlist with an email and optional referral code
   *
   * @example
   * const waitlistClient = new WaitlistClient({ baseUrl: "http://localhost:3000" });
   * const result = await waitlistClient.join({ email: "user@example.com", referralCode: "REF-123" });
   */
  async join(input: JoinInput): Promise<JoinResult> {
    const { email, referralCode } = input;
    const result = await this.api.post(
      `${this.prefix}/join`,
      JoinResultSchema,
      {
        throwOnValidationError: true,
        body: { email, referralCode },
      }
    );
    return result;
  }

  /**
   * Leave the waitlist by email
   *
   * @example
   * const waitlistClient = new WaitlistClient({ baseUrl: "http://localhost:3000" });
   * await waitlistClient.leave("user@example.com");
   */
  async leave(email: Email): Promise<void> {
    await this.api.post(`${this.prefix}/leave`, EmptyResponseSchema, {
      throwOnValidationError: true,
      body: { email },
    });
  }

  /**
   * Get a user's current position in the waitlist.
   * Note: Requires a server endpoint to be implemented.
   */
  async getPosition(_email: Email): Promise<number | undefined> {
    await Promise.resolve();
    throw new Error("WaitlistClient.getPosition is not implemented yet.");
  }

  /**
   * Get the waitlist leaderboard
   *
   * @example
   * const waitlistClient = new WaitlistClient({ baseUrl: "http://localhost:3000" });
   * const leaderboard = await waitlistClient.getLeaderboard();
   */
  async getLeaderboard(): Promise<Leaderboard> {
    return await this.api.get(
      `${this.prefix}/leaderboard`,
      LeaderboardResponseSchema
    );
  }
}
