import { createFetch } from "@zap-studio/fetch";
import type { Email } from "@zap-studio/validation/email/types";
import { DEFAULT_API_PREFIX } from "./constants";
import type { WaitlistService } from "./contract";
import type { Leaderboard, PositionStrategy } from "./leaderboard/types";
import type { ReferralKey, ReferralLink } from "./referral/types";
import {
  CountResponseSchema,
  EmailEntryListResponseSchema,
  EmailEntryResponseSchema,
  EmailEntrySchema,
  EmailListResponseSchema,
  EmptyResponseSchema,
  JoinResultSchema,
  LeaderboardResponseSchema,
  PositionResponseSchema,
  ReferralLinkListResponseSchema,
  ReferralLinkSchema,
} from "./schemas";
import type { EmailEntry, JoinInput, JoinResult, ReferralCode } from "./types";

const trimTrailingSlashes = (value: string): string => {
  let end = value.length;
  while (end > 0 && value.charCodeAt(end - 1) === 47) {
    end -= 1;
  }
  return value.slice(0, end);
};

/** Options for the WaitlistClient */
export interface WaitlistClientOptions {
  /** The base URL for the API */
  baseUrl: string;
  /** Optional API prefix for waitlist routes */
  prefix?: string;
}

export class WaitlistClient implements WaitlistService {
  /** The base URL for the API */
  readonly baseUrl: string;

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
    this.prefix = trimTrailingSlashes(withLeadingSlash);

    const { api } = createFetch({
      baseURL: baseUrl,
      headers: { "Content-Type": "application/json" },
    });

    this.api = api;
  }

  /** Creates a new email entry in the waitlist */
  async create(entry: EmailEntry): Promise<EmailEntry> {
    return await this.api.post(`${this.prefix}/entries`, EmailEntrySchema, {
      throwOnValidationError: true,
      body: { entry },
    });
  }

  /** Creates a new referral link in the waitlist */
  async createReferral(link: ReferralLink): Promise<ReferralLink> {
    return await this.api.post(`${this.prefix}/referrals`, ReferralLinkSchema, {
      throwOnValidationError: true,
      body: { link },
    });
  }

  /** Updates an existing email entry in the waitlist */
  async update(id: Email, patch: Partial<EmailEntry>): Promise<EmailEntry> {
    return await this.api.patch(`${this.prefix}/entries`, EmailEntrySchema, {
      throwOnValidationError: true,
      body: { id, patch },
    });
  }

  /** Updates an existing referral link in the waitlist */
  async updateReferral(
    key: ReferralKey,
    patch: Partial<ReferralLink>
  ): Promise<ReferralLink> {
    return await this.api.patch(
      `${this.prefix}/referrals`,
      ReferralLinkSchema,
      {
        throwOnValidationError: true,
        body: { key, patch },
      }
    );
  }

  /** Deletes an email entry from the waitlist */
  async delete(id: Email): Promise<void> {
    await this.api.post(`${this.prefix}/entries/delete`, EmptyResponseSchema, {
      throwOnValidationError: true,
      body: { email: id },
    });
  }

  /** Deletes a referral link from the waitlist */
  async deleteReferral(key: ReferralKey): Promise<void> {
    await this.api.post(
      `${this.prefix}/referrals/delete`,
      EmptyResponseSchema,
      {
        throwOnValidationError: true,
        body: { key },
      }
    );
  }

  /** Finds an email entry by its email address */
  async findByEmail(email: Email): Promise<EmailEntry | null> {
    return await this.api.get(
      `${this.prefix}/entries/by-email`,
      EmailEntryResponseSchema,
      {
        throwOnValidationError: true,
        searchParams: { email },
      }
    );
  }

  /** Find a referrer by their referral code */
  async findByReferralCode(code: ReferralCode): Promise<EmailEntry | null> {
    return await this.api.get(
      `${this.prefix}/entries/by-referral-code`,
      EmailEntryResponseSchema,
      {
        throwOnValidationError: true,
        searchParams: { code },
      }
    );
  }

  /** Get referral count for a specific email */
  async getReferralCount(email: Email): Promise<number> {
    return await this.api.get(
      `${this.prefix}/referrals/count`,
      CountResponseSchema,
      {
        throwOnValidationError: true,
        searchParams: { email },
      }
    );
  }

  /** Lists all email entries in the waitlist */
  async list(): Promise<EmailEntry[]> {
    return await this.api.get(
      `${this.prefix}/entries`,
      EmailEntryListResponseSchema,
      {
        throwOnValidationError: true,
      }
    );
  }

  /** List all emails in the waitlist */
  async listEmails(): Promise<Email[]> {
    return await this.api.get(
      `${this.prefix}/emails`,
      EmailListResponseSchema,
      {
        throwOnValidationError: true,
      }
    );
  }

  /** Lists all referral links in the waitlist */
  async listReferrals(): Promise<ReferralLink[]> {
    return await this.api.get(
      `${this.prefix}/referrals`,
      ReferralLinkListResponseSchema,
      {
        throwOnValidationError: true,
      }
    );
  }

  /** Counts the total number of email entries in the waitlist */
  async count(): Promise<number> {
    return await this.api.get(`${this.prefix}/count`, CountResponseSchema, {
      throwOnValidationError: true,
    });
  }

  /** Counts the total number of referral links in the waitlist */
  async countReferrals(): Promise<number> {
    return await this.api.get(
      `${this.prefix}/count-referrals`,
      CountResponseSchema,
      {
        throwOnValidationError: true,
      }
    );
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
  async getPosition(email: Email): Promise<number | null> {
    const result = await this.api.get(
      `${this.prefix}/position`,
      PositionResponseSchema,
      {
        throwOnValidationError: true,
        searchParams: { email },
      }
    );

    return result;
  }

  /**
   * Get the waitlist leaderboard
   *
   * @example
   * const waitlistClient = new WaitlistClient({ baseUrl: "http://localhost:3000" });
   * const leaderboard = await waitlistClient.getLeaderboard();
   */
  async getLeaderboard(
    positionStrategy?: PositionStrategy
  ): Promise<Leaderboard> {
    return await this.api.get(
      `${this.prefix}/leaderboard`,
      LeaderboardResponseSchema,
      {
        throwOnValidationError: true,
        searchParams: positionStrategy ? { positionStrategy } : undefined,
      }
    );
  }
}
