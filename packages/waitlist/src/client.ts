import { createFetch } from "@zap-studio/fetch";
import z from "zod";
import type { LeaderboardEntry } from "./types";

const EmailSchema = z.email();

/** Schema for join response validation */
const JoinResponseSchema: z.ZodObject<{
  email: z.ZodEmail;
  referralCode: z.ZodOptional<z.ZodString>;
}> = z.object({
  email: EmailSchema,
  referralCode: z.string().optional(),
});

/** Schema for leaderboard entry validation */
const LeaderboardEntrySchema: z.ZodObject<{
  email: z.ZodEmail;
  score: z.ZodNumber;
}> = z.object({
  email: EmailSchema,
  score: z.number(),
});

/** Schema for leaderboard response validation */
const LeaderboardResponseSchema: z.ZodArray<typeof LeaderboardEntrySchema> =
  z.array(LeaderboardEntrySchema);

/** Options for the WaitlistClient */
export interface WaitlistClientOptions {
  /** The base URL for the API */
  baseUrl: string;
}

export class WaitlistClient {
  /** The base URL for the API */
  baseUrl: string;

  /** The configured fetch instance */
  private readonly api: ReturnType<typeof createFetch>["api"];

  /**
   * Creates an instance of WaitlistClient.
   *
   * @example
   * const client = new WaitlistClient({ baseUrl: "http://localhost:3000" });
   */
  constructor({ baseUrl }: WaitlistClientOptions) {
    this.baseUrl = baseUrl;

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
   * const result = await waitlistClient.join("user@example.com", "REF-123");
   */
  async join(
    email: string,
    referralCode?: string
  ): Promise<z.infer<typeof JoinResponseSchema>> {
    const result = await this.api.post(
      "/api/waitlist/join",
      JoinResponseSchema,
      {
        throwOnValidationError: true,
        body: { email, referralCode },
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
  async getLeaderboard(): Promise<LeaderboardEntry[]> {
    return await this.api.get(
      "/api/waitlist/leaderboard",
      LeaderboardResponseSchema
    );
  }
}
