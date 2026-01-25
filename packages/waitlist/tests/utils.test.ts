// biome-ignore-all lint/style/noMagicNumbers: This is a test file so magic numbers are fine.
// biome-ignore-all lint/performance/useTopLevelRegex: This is a test file so performance is not critical.

import { describe, expect, it } from "vitest";
import { calculatePosition } from "../src/leaderboard";
import type { ReferralLink } from "../src/referral/types";
import type { EmailEntry } from "../src/types";
import { generateReferralCode } from "../src/utils";

describe("generateReferralCode", () => {
  it("returns deterministic code when seed provided", () => {
    const code6 = generateReferralCode(6);
    const code7 = generateReferralCode(7);
    const code8 = generateReferralCode(8);

    expect(code6).toMatch(/^[A-Z0-9]{3}-[A-Z0-9]{3}$/);
    expect(code7).toMatch(/^[A-Z0-9]{3}-[A-Z0-9]{4}$/);
    expect(code8).toMatch(/^[A-Z0-9]{4}-[A-Z0-9]{4}$/);
  });

  it("returns random code when no seed", () => {
    const a = generateReferralCode(8);
    const b = generateReferralCode();
    expect(a).not.toEqual(b);
    expect(a).toHaveLength(8 + 1); // including dash
  });
});

describe("calculatePosition", () => {
  const entries: EmailEntry[] = [
    { email: "a@test.com", createdAt: new Date(1) },
    { email: "b@test.com", createdAt: new Date(2) },
    { email: "c@test.com", createdAt: new Date(3) },
  ];

  it("returns correct position", () => {
    expect(calculatePosition(entries, "a@test.com")).toBe(1);
    expect(calculatePosition(entries, "c@test.com")).toBe(3);
    expect(calculatePosition(entries, "d@test.com")).toBeUndefined();
  });

  it("routes to referral strategy", () => {
    const referralEntries: EmailEntry[] = [
      {
        email: "a@test.com",
        createdAt: new Date(1),
        referralCode: "AAA",
      },
      {
        email: "b@test.com",
        createdAt: new Date(2),
        referralCode: "BBB",
      },
      {
        email: "c@test.com",
        createdAt: new Date(3),
        referralCode: "CCC",
      },
      { email: "d@test.com", createdAt: new Date(4), referredBy: "BBB" },
      { email: "e@test.com", createdAt: new Date(5), referredBy: "BBB" },
      { email: "f@test.com", createdAt: new Date(6), referredBy: "AAA" },
    ];

    const referrals: ReferralLink[] = [
      {
        referrer: "b@test.com",
        referee: "d@test.com",
        createdAt: new Date(4),
      },
      {
        referrer: "b@test.com",
        referee: "e@test.com",
        createdAt: new Date(5),
      },
      {
        referrer: "a@test.com",
        referee: "f@test.com",
        createdAt: new Date(6),
      },
    ];

    expect(
      calculatePosition(referralEntries, "b@test.com", {
        strategy: "number-of-referrals",
        referrals,
      })
    ).toBe(1);
    expect(
      calculatePosition(referralEntries, "a@test.com", {
        strategy: "number-of-referrals",
        referrals,
      })
    ).toBe(2);
    expect(
      calculatePosition(referralEntries, "c@test.com", {
        strategy: "number-of-referrals",
        referrals,
      })
    ).toBe(3);
  });
});
