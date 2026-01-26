import type { Email } from "@zap-studio/validation/email/types";
import { DEFAULT_POSITION_STRATEGY } from "../constants";
import { computeReferralScore } from "../referral";
import type { ReferralLink } from "../referral/types";
import type { EmailEntry } from "../types";
import type {
  CalculatePositionOptions,
  CalculateScoreOptions,
  PositionStrategy,
} from "./types";

/**
 * Calculates a single participant's score based on the provided position strategy.
 *
 * @example
 * const entries = [
 *   { email: "jean@example.com", createdAt: new Date("2023-01-01") },
 *   { email: "alice@example.com", createdAt: new Date("2023-01-02") },
 *   { email: "bob@example.com", createdAt: new Date("2023-01-03") },
 * ];
 *
 * calculateScore(entries, "bob@example.com", { strategy: "creation-date" }); // 1
 * calculateScore(entries, "bob@example.com", [], { strategy: "number-of-referrals" }); // 0
 */
export function calculateScore(
  entries: EmailEntry[],
  email: Email,
  options?: CalculateScoreOptions
): number | undefined;
export function calculateScore(
  entries: EmailEntry[],
  email: Email,
  referrals: ReferralLink[],
  options?: CalculateScoreOptions
): number | undefined;
export function calculateScore(
  entries: EmailEntry[],
  email: Email,
  referralsOrOptions: ReferralLink[] | CalculateScoreOptions = {},
  maybeOptions: CalculateScoreOptions = {}
): number | undefined {
  if (entries.length === 0 || !entries.find((e) => e.email === email)) {
    return;
  }

  const { referrals, options } = resolveScoreInputs(
    referralsOrOptions,
    maybeOptions
  );

  const scores = referrals
    ? calculateScores(entries, referrals, options)
    : calculateScores(entries, options);

  return scores.get(email);
}

/**
 * Compute position by a configurable strategy.
 *
 * @example
 * const entries = [
 *   { email: "jean@example.com", createdAt: new Date("2023-01-01") },
 *   { email: "alice@example.com", createdAt: new Date("2023-01-02") },
 *   { email: "bob@example.com", createdAt: new Date("2023-01-03") },
 * ];
 *
 * calculatePosition(entries, "bob@example.com"); // 3
 * calculatePosition(entries, "bob@example.com", { strategy: "creation-date" }); // 3
 * calculatePosition(entries, "bob@example.com", {
 *   strategy: "number-of-referrals",
 *   referrals,
 * });
 */
export function calculatePosition(
  entries: EmailEntry[],
  email: Email,
  options: CalculatePositionOptions = {}
): number | null {
  if (entries.length === 0 || !entries.find((e) => e.email === email)) {
    return null;
  }

  const strategy: PositionStrategy =
    options.strategy ?? DEFAULT_POSITION_STRATEGY;
  const referrals = options.referrals;

  let scores: Map<Email, number>;
  if (strategy === "number-of-referrals") {
    if (!referrals) {
      throw new Error(
        "Referrals are required when using the number-of-referrals strategy."
      );
    }
    scores = calculateScores(entries, referrals, { strategy });
  } else {
    scores = calculateScores(entries, { strategy });
  }

  const sorted = sortEntriesByScores(entries, scores);
  return sorted.findIndex((e) => e.email === email) + 1;
}

/**
 * Calculates scores for each email entry based on the provided position strategy.
 *
 * @example
 * const entries = [
 *   { email: "jean@example.com", createdAt: new Date("2023-01-01") },
 *   { email: "alice@example.com", createdAt: new Date("2023-01-02") },
 *   { email: "bob@example.com", createdAt: new Date("2023-01-03") },
 * ];
 *
 * calculateScores(entries, { strategy: "creation-date" });
 * // {
 * //   'jean@example.com' => 3,
 * //   'alice@example.com' => 2,
 * //   'bob@example.com' => 1
 * // }
 */
export function calculateScores(
  entries: EmailEntry[],
  options?: CalculateScoreOptions
): Map<Email, number>;
export function calculateScores(
  entries: EmailEntry[],
  referrals: ReferralLink[],
  options?: CalculateScoreOptions
): Map<Email, number>;
export function calculateScores(
  entries: EmailEntry[],
  referralsOrOptions: ReferralLink[] | CalculateScoreOptions = {},
  maybeOptions: CalculateScoreOptions = {}
): Map<Email, number> {
  const { referrals, options } = resolveScoreInputs(
    referralsOrOptions,
    maybeOptions
  );
  const strategy: PositionStrategy =
    options.strategy ?? DEFAULT_POSITION_STRATEGY;

  switch (strategy) {
    case "number-of-referrals": {
      if (!referrals) {
        throw new Error(
          "Referrals are required when using the number-of-referrals strategy."
        );
      }

      const scores = new Map<Email, number>();
      for (const entry of entries) {
        scores.set(entry.email, computeReferralScore(entry.email, referrals));
      }

      return scores;
    }
    case "creation-date": {
      const sortedEntries = sortByCreatedAt(entries);
      const total = sortedEntries.length;
      const scores = new Map<Email, number>();

      for (const [index, entry] of sortedEntries.entries()) {
        scores.set(entry.email, total - index);
      }

      return scores;
    }
    default:
      return unhandledStrategy(strategy);
  }
}

/**
 * Sorts entries by score (descending) with stable tie-breakers.
 *
 * Rules:
 * - Entries with higher scores are sorted first.
 * - Entries with the same score are sorted by their creation date in ascending order.
 * - Entries with the same score and creation date are sorted by their email in ascending order.
 *
 * @example
 * const scores = calculateScores(entries, { strategy: "creation-date" });
 * const ordered = sortEntriesByScores(entries, scores);
 */
export function sortEntriesByScores(
  entries: EmailEntry[],
  scores: Map<Email, number>
): EmailEntry[] {
  return [...entries].sort((a, b) => {
    const aScore = scores.get(a.email) ?? 0;
    const bScore = scores.get(b.email) ?? 0;
    if (aScore !== bScore) {
      return bScore - aScore;
    }

    const createdAtDelta = a.createdAt.getTime() - b.createdAt.getTime();
    if (createdAtDelta !== 0) {
      return createdAtDelta;
    }

    return a.email.localeCompare(b.email);
  });
}

/**
 * This function is used to resolve the score inputs for overloaded functions.
 */
function resolveScoreInputs(
  referralsOrOptions: ReferralLink[] | CalculateScoreOptions,
  maybeOptions: CalculateScoreOptions
): { referrals?: ReferralLink[]; options: CalculateScoreOptions } {
  if (Array.isArray(referralsOrOptions)) {
    return { referrals: referralsOrOptions, options: maybeOptions };
  }
  return { options: referralsOrOptions };
}

/**
 * This function is used to handle unhandled strategies.
 */
export function unhandledStrategy(value: never | undefined): never {
  throw new Error(`Unhandled strategy: ${String(value)}`);
}

/**
 * Sorts entries by their creation date in ascending order.
 */
function sortByCreatedAt(entries: EmailEntry[]): EmailEntry[] {
  return [...entries].sort(
    (a, b) =>
      a.createdAt.getTime() - b.createdAt.getTime() ||
      a.email.localeCompare(b.email)
  );
}
