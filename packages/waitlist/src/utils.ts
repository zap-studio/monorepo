import { customAlphabet } from "nanoid";
import { DEFAULT_REFERRAL_CODE_LENGTH } from "./constants";

/**
 * Generate short human-readable referral codes (6 chars with dash, uppercase letters and numbers).
 *
 * @example
 * generateReferralCode(); // e.g., "4F7-G8H"
 * generateReferralCode(8); // e.g., "A1B2-C3D4"
 */
export function generateReferralCode(
  length: number = DEFAULT_REFERRAL_CODE_LENGTH
): string {
  const effectiveLength = length;
  const nanoid = customAlphabet(
    "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
    effectiveLength
  );
  const code = nanoid();
  const mid = Math.floor(effectiveLength / 2);
  return `${code.slice(0, mid)}-${code.slice(mid)}`;
}
