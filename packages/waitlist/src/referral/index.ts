import { generateReferralCode } from "../core/utils";
import type { Email, EmailEntry, ReferralLink } from "../types";

/**
 * Computes a user's total referral score based on all referral links.
 *
 * @example
 * const participant: Email = "user@example.com";
 * const links: ReferralLink[] = [
 *   { referrer: "user@example.com", referee: "other@example.com", createdAt: new Date() },
 *   { referrer: "user@example.com", referee: "jean@example.com", createdAt: new Date() },
 *   { referrer: "john@example.com", referee: "alice@example.com", createdAt: new Date() },
 * ];
 * const score = computeReferralScore(participant, links); // 2
 */
export function computeReferralScore(
  participant: Email,
  links: ReferralLink[]
): number {
  return links.filter((l) => l.referrer === participant).length;
}

/**
 * Get the list of referees for a given referrer.
 *
 * @example
 * const participant: Email = "user@example.com";
 * const referees = getReferees(participant); // ["alice@example.com", "bob@example.com"]
 */
export function getReferees(referrer: Email, links: ReferralLink[]): Email[] {
  return links.filter((l) => l.referrer === referrer).map((l) => l.referee);
}

/**
 * Add a unique referral code to a participant's entry.
 *
 * @example
 * const participant: EmailEntry = { email: "user@example.com", createdAt: new Date() };
 * const participantWithCode = addReferralCode(participant, 8); // { email: "user@example.com", createdAt: new Date(), referralCode: "XXXX-XXXX" }
 */
export function addReferralCode(
  participant: EmailEntry,
  referralCodeLength?: number
): EmailEntry & { referralCode: string } {
  const code = generateReferralCode(referralCodeLength);
  return { ...participant, referralCode: code };
}

/**
 * Create a referral link between a referrer and a referee.
 *
 * @example
 * const referrer: Email = "referrer@example.com";
 * const referee: Email = "referee@example.com";
 * const referralLink = createReferralLink(referrer, referee); // { referrer: "user@example.com", referee: "referee@example.com", createdAt: new Date() }
 */
export function createReferralLink(
  referrer: Email,
  referee: Email
): ReferralLink {
  return {
    referrer,
    referee,
    createdAt: new Date(),
  };
}
