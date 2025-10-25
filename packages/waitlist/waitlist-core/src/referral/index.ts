import type { Email, EmailEntry, ReferralLink } from "../types";
import { generateReferralCode } from "../utils";

/**
 * Computes a user's total referral score based on all referral links.
 *
 * @example
 * const participant: EmailEntry = { email: "user@example.com", createdAt: new Date() };
 * const links: ReferralLink[] = [
 *   { referrerId: "user@example.com", refereeId: "other@example.com", createdAt: new Date() },
 *   { referrerId: "user@example.com", refereeId: "jean@example.com", createdAt: new Date() },
 *   { referrerId: "john@example.com", refereeId: "alice@example.com", createdAt: new Date() },
 * ];
 * const score = computeReferralScore(participant, links); // 2
 */
export function computeReferralScore(
	participant: EmailEntry,
	links: ReferralLink[],
): number {
	return links.filter((l) => l.referrerId === participant.email).length;
}

/**
 * Get the list of referees for a given referrer.
 *
 * @example
 * const participant: EmailEntry = { email: "user@example.com", createdAt: new Date() };
 * const referees = getReferees(participant); // ["alice@example.com", "bob@example.com"]
 */
export function getReferees(
	referrer: EmailEntry,
	links: ReferralLink[],
): Email[] {
	return links
		.filter((l) => l.referrerId === referrer.email)
		.map((l) => l.refereeId);
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
	referralCodeLength?: number,
): EmailEntry & { referralCode: string } {
	const code = generateReferralCode(referralCodeLength);
	return { ...participant, referralCode: code };
}

/**
 * Create a referral link between a referrer and a referee.
 *
 * @example
 * const referrer: EmailEntry = { email: "user@example.com", createdAt: new Date() };
 * const referee: EmailEntry = { email: "referee@example.com", createdAt: new Date() };
 * const referralLink = createReferralLink(referrer, referee); // { referrerId: "user@example.com", refereeId: "referee@example.com", createdAt: new Date() }
 */
export function createReferralLink(
	referrer: EmailEntry,
	referee: EmailEntry,
): ReferralLink {
	return {
		referrerId: referrer.email,
		refereeId: referee.email,
		createdAt: new Date(),
	};
}
