import { customAlphabet } from "nanoid";
import type { EmailEntry } from "./types";

/**
 * Generate short human-readable referral codes (6 chars with dash, uppercase letters and numbers).
 *
 * @example
 * generateReferralCode(); // e.g., "4F7-G8H"
 * generateReferralCode(8); // e.g., "A1B-C2D3"
 */
export function generateReferralCode(length: number = 6): string {
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
 *   { id: "1", createdAt: new Date("2023-01-01") },
 *   { id: "2", createdAt: new Date("2023-01-02") },
 *   { id: "3", createdAt: new Date("2023-01-03") },
 * ];
 * calculatePosition(entries, "2"); // 2
 */
export function calculatePosition(entries: EmailEntry[], id: string): number {
	const sorted = [...entries].sort(
		(a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
	);
	return sorted.findIndex((e) => e.id === id) + 1;
}
