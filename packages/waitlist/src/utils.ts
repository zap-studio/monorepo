import type { Email } from "@zap-studio/validation/email/types";
import { customAlphabet } from "nanoid";
import type { EmailEntry } from "./types";

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
 * Compute position by creation date order.
 *
 * @example
 * const entries = [
 *   { email: "jean@example.com", createdAt: new Date("2023-01-01") },
 *   { email: "alice@example.com", createdAt: new Date("2023-01-02") },
 *   { email: "bob@example.com", createdAt: new Date("2023-01-03") },
 * ];
 * calculatePosition(entries, "bob@example.com"); // 3
 */
export function calculatePosition(
  entries: EmailEntry[],
  email: Email
): number | undefined {
  if (entries.length === 0 || !entries.find((e) => e.email === email)) {
    return;
  }
  const sorted = [...entries].sort(
    (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
  );
  return sorted.findIndex((e) => e.email === email) + 1;
}
