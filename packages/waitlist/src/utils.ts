import type { Email } from "@zap-studio/validation/email/types";
import { customAlphabet } from "nanoid";
import type {
  CalculatePositionOptions,
  EmailEntry,
  PositionStrategy,
} from "./types";

/**
 * Generate short human-readable referral codes (6 chars with dash, uppercase letters and numbers).
 *
 * @example
 * generateReferralCode(); // e.g., "4F7-G8H"
 * generateReferralCode(8); // e.g., "A1B2-C3D4"
 */
export function generateReferralCode(length = 6): string {
  const nanoid = customAlphabet("ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789", length);
  const code = nanoid();
  const mid = Math.floor(length / 2);
  return `${code.slice(0, mid)}-${code.slice(mid)}`;
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
 */
export function calculatePosition(
  entries: EmailEntry[],
  email: Email,
  options: CalculatePositionOptions = {}
): number | undefined {
  if (entries.length === 0 || !entries.find((e) => e.email === email)) {
    return;
  }

  const strategy: PositionStrategy = options.strategy ?? "creation-date";
  const sorted = sortEntriesByPositionStrategy(entries, strategy);

  return sorted.findIndex((e) => e.email === email) + 1;
}

/**
 * Sorts entries by their position strategy.
 */
export function sortEntriesByPositionStrategy(
  entries: EmailEntry[],
  strategy: PositionStrategy
): EmailEntry[] {
  return strategy === "number-of-referrals"
    ? sortByReferrals(entries)
    : sortByCreatedAt(entries);
}

/**
 * Sorts entries by their creation date in ascending order.
 */
function sortByCreatedAt(entries: EmailEntry[]): EmailEntry[] {
  return [...entries].sort(
    (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
  );
}

/**
 * Sorts entries by their number of referrals in descending order.
 */
function sortByReferrals(entries: EmailEntry[]): EmailEntry[] {
  const referralCounts = buildReferralCounts(entries);
  return [...entries].sort((a, b) => {
    const aCount = referralCounts.get(a.referralCode ?? "") ?? 0;
    const bCount = referralCounts.get(b.referralCode ?? "") ?? 0;

    if (aCount !== bCount) {
      return bCount - aCount;
    }

    const createdAtDelta = a.createdAt.getTime() - b.createdAt.getTime();
    if (createdAtDelta !== 0) {
      return createdAtDelta;
    }

    return a.email.localeCompare(b.email);
  });
}

/**
 * Builds a map of referral codes to their respective counts.
 */
function buildReferralCounts(entries: EmailEntry[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const entry of entries) {
    if (!entry.referredBy) {
      continue;
    }
    counts.set(entry.referredBy, (counts.get(entry.referredBy) ?? 0) + 1);
  }
  return counts;
}
