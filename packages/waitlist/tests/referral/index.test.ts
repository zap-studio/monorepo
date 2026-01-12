// biome-ignore-all lint/style/noMagicNumbers: This is a test file so magic numbers are fine.

import { describe, expect, it } from "vitest";
import {
  addReferralCode,
  computeReferralScore,
  createReferralLink,
  getReferees,
} from "../../src/referral";
import type { Email, EmailEntry, ReferralLink } from "../../src/types";

describe("referral logic", () => {
  describe("computeReferralScore", () => {
    it("should return 0 when participant has no referrals", () => {
      const participant: Email = "user@example.com";
      const links: ReferralLink[] = [];

      const score = computeReferralScore(participant, links);

      expect(score).toBe(0);
    });

    it("should return correct score when participant has referrals", () => {
      const participant: Email = "user@example.com";
      const links: ReferralLink[] = [
        {
          referrer: "user@example.com",
          referee: "other@example.com",
          createdAt: new Date(),
        },
        {
          referrer: "user@example.com",
          referee: "jean@example.com",
          createdAt: new Date(),
        },
      ];

      const score = computeReferralScore(participant, links);

      expect(score).toBe(2);
    });

    it("should only count referrals where participant is the referrer", () => {
      const participant: Email = "user@example.com";
      const links: ReferralLink[] = [
        {
          referrer: "user@example.com",
          referee: "other@example.com",
          createdAt: new Date(),
        },
        {
          referrer: "john@example.com",
          referee: "user@example.com",
          createdAt: new Date(),
        },
        {
          referrer: "alice@example.com",
          referee: "bob@example.com",
          createdAt: new Date(),
        },
      ];

      const score = computeReferralScore(participant, links);

      expect(score).toBe(1);
    });

    it("should handle multiple referrals correctly", () => {
      const participant: Email = "popular@example.com";
      const links: ReferralLink[] = [
        {
          referrer: "popular@example.com",
          referee: "referee1@example.com",
          createdAt: new Date(),
        },
        {
          referrer: "popular@example.com",
          referee: "referee2@example.com",
          createdAt: new Date(),
        },
        {
          referrer: "popular@example.com",
          referee: "referee3@example.com",
          createdAt: new Date(),
        },
        {
          referrer: "popular@example.com",
          referee: "referee4@example.com",
          createdAt: new Date(),
        },
        {
          referrer: "popular@example.com",
          referee: "referee5@example.com",
          createdAt: new Date(),
        },
      ];

      const score = computeReferralScore(participant, links);

      expect(score).toBe(5);
    });
  });

  describe("getReferees", () => {
    it("should return empty array when referrer has no referees", () => {
      const referrer: Email = "user@example.com";
      const links: ReferralLink[] = [];

      const referees = getReferees(referrer, links);

      expect(referees).toEqual([]);
    });

    it("should return all referees for a given referrer", () => {
      const referrer: Email = "user@example.com";
      const links: ReferralLink[] = [
        {
          referrer: "user@example.com",
          referee: "alice@example.com",
          createdAt: new Date(),
        },
        {
          referrer: "user@example.com",
          referee: "bob@example.com",
          createdAt: new Date(),
        },
      ];

      const referees = getReferees(referrer, links);

      expect(referees).toEqual(["alice@example.com", "bob@example.com"]);
    });

    it("should only return referees for the specified referrer", () => {
      const referrer: Email = "user@example.com";
      const links: ReferralLink[] = [
        {
          referrer: "user@example.com",
          referee: "alice@example.com",
          createdAt: new Date(),
        },
        {
          referrer: "other@example.com",
          referee: "bob@example.com",
          createdAt: new Date(),
        },
        {
          referrer: "user@example.com",
          referee: "charlie@example.com",
          createdAt: new Date(),
        },
      ];

      const referees = getReferees(referrer, links);

      expect(referees).toEqual(["alice@example.com", "charlie@example.com"]);
    });

    it("should maintain order of referees", () => {
      const referrer: Email = "user@example.com";
      const links: ReferralLink[] = [
        {
          referrer: "user@example.com",
          referee: "first@example.com",
          createdAt: new Date("2023-01-01"),
        },
        {
          referrer: "user@example.com",
          referee: "second@example.com",
          createdAt: new Date("2023-01-02"),
        },
        {
          referrer: "user@example.com",
          referee: "third@example.com",
          createdAt: new Date("2023-01-03"),
        },
      ];

      const referees = getReferees(referrer, links);

      expect(referees).toEqual([
        "first@example.com",
        "second@example.com",
        "third@example.com",
      ]);
    });
  });

  describe("addReferralCode", () => {
    it("should add a referral code to a participant", () => {
      const participant: EmailEntry = {
        email: "user@example.com",
        createdAt: new Date(),
      };

      const result = addReferralCode(participant);

      expect(result.email).toBe(participant.email);
      expect(result.createdAt).toBe(participant.createdAt);
      expect(result.referralCode).toBeDefined();
      expect(typeof result.referralCode).toBe("string");
    });

    it("should generate a code with default length (6 chars + dash)", () => {
      const participant: EmailEntry = {
        email: "user@example.com",
        createdAt: new Date(),
      };

      const result = addReferralCode(participant);

      // Default is 6 chars: XXX-XXX (7 including dash)
      expect(result.referralCode).toHaveLength(7);
      // biome-ignore lint/performance/useTopLevelRegex: This is a test file so performance is not critical.
      expect(result.referralCode).toMatch(/^[A-Z0-9]{3}-[A-Z0-9]{3}$/);
    });

    it("should generate a code with custom length", () => {
      const participant: EmailEntry = {
        email: "user@example.com",
        createdAt: new Date(),
      };

      const result = addReferralCode(participant, 8);

      // 8 chars: XXXX-XXXX (9 including dash)
      expect(result.referralCode).toHaveLength(9);
      // biome-ignore lint/performance/useTopLevelRegex: This is a test file so performance is not critical.
      expect(result.referralCode).toMatch(/^[A-Z0-9]{4}-[A-Z0-9]{4}$/);
    });

    it("should preserve existing participant data", () => {
      const participant: EmailEntry = {
        email: "user@example.com",
        createdAt: new Date("2023-01-01"),
        meta: { source: "campaign" },
      };

      const result = addReferralCode(participant);

      expect(result.email).toBe("user@example.com");
      expect(result.createdAt).toEqual(new Date("2023-01-01"));
      expect(result.meta).toEqual({ source: "campaign" });
      expect(result.referralCode).toBeDefined();
    });

    it("should generate unique codes for different participants", () => {
      const participant1: EmailEntry = {
        email: "user1@example.com",
        createdAt: new Date(),
      };
      const participant2: EmailEntry = {
        email: "user2@example.com",
        createdAt: new Date(),
      };

      const result1 = addReferralCode(participant1);
      const result2 = addReferralCode(participant2);

      // While not guaranteed, it's extremely unlikely to get the same code (flaky test if it happens)
      expect(result1.referralCode).not.toBe(result2.referralCode);
    });

    it("should generate codes with uppercase letters and numbers only", () => {
      const participant: EmailEntry = {
        email: "user@example.com",
        createdAt: new Date(),
      };

      // Test multiple times to ensure consistency
      for (let i = 0; i < 10; i += 1) {
        const result = addReferralCode(participant);
        // biome-ignore lint/performance/useTopLevelRegex: This is a test file so performance is not critical.
        expect(result.referralCode).toMatch(/^[A-Z0-9]+-[A-Z0-9]+$/);
      }
    });
  });

  describe("createReferralLink", () => {
    it("should create a referral link between referrer and referee", () => {
      const referrer: Email = "referrer@example.com";
      const referee: Email = "referee@example.com";

      const link = createReferralLink(referrer, referee);

      expect(link.referrer).toBe("referrer@example.com");
      expect(link.referee).toBe("referee@example.com");
      expect(link.createdAt).toBeInstanceOf(Date);
    });

    it("should set createdAt to current date", () => {
      const referrer: Email = "referrer@example.com";
      const referee: Email = "referee@example.com";

      const beforeCreation = new Date();
      const link = createReferralLink(referrer, referee);
      const afterCreation = new Date();

      expect(link.createdAt.getTime()).toBeGreaterThanOrEqual(
        beforeCreation.getTime()
      );
      expect(link.createdAt.getTime()).toBeLessThanOrEqual(
        afterCreation.getTime()
      );
    });

    it("should create independent link from participant entries", () => {
      const referrer: Email = "referrer@example.com";
      const referee: Email = "referee@example.com";

      const link = createReferralLink(referrer, referee);

      // Link should only contain required fields
      expect(Object.keys(link)).toEqual(["referrer", "referee", "createdAt"]);
      expect(link.referrer).toBe("referrer@example.com");
      expect(link.referee).toBe("referee@example.com");
    });

    it("should handle multiple referral links from same referrer", () => {
      const referrer: Email = "referrer@example.com";
      const referee1: Email = "referee1@example.com";
      const referee2: Email = "referee2@example.com";

      const link1 = createReferralLink(referrer, referee1);
      const link2 = createReferralLink(referrer, referee2);

      expect(link1.referrer).toBe("referrer@example.com");
      expect(link2.referrer).toBe("referrer@example.com");
      expect(link1.referee).toBe("referee1@example.com");
      expect(link2.referee).toBe("referee2@example.com");
    });
  });

  describe("integration tests", () => {
    it("should correctly track referral chain", () => {
      // Create participants
      const alice: EmailEntry = {
        email: "alice@example.com",
        createdAt: new Date("2023-01-01"),
      };
      const bob: EmailEntry = {
        email: "bob@example.com",
        createdAt: new Date("2023-01-02"),
      };
      const charlie: EmailEntry = {
        email: "charlie@example.com",
        createdAt: new Date("2023-01-03"),
      };

      // Add referral codes
      const aliceWithCode = addReferralCode(alice);
      const bobWithCode = addReferralCode(bob);

      // Create referral links
      const links: ReferralLink[] = [
        createReferralLink(aliceWithCode.email, bob.email),
        createReferralLink(bobWithCode.email, charlie.email),
      ];

      // Alice referred Bob
      expect(computeReferralScore(alice.email, links)).toBe(1);
      expect(getReferees(alice.email, links)).toEqual(["bob@example.com"]);

      // Bob referred Charlie
      expect(computeReferralScore(bob.email, links)).toBe(1);
      expect(getReferees(bob.email, links)).toEqual(["charlie@example.com"]);

      // Charlie referred nobody
      expect(computeReferralScore(charlie.email, links)).toBe(0);
      expect(getReferees(charlie.email, links)).toEqual([]);
    });

    it("should handle complex referral network", () => {
      const influencer: Email = "influencer@example.com";
      const user1: Email = "user1@example.com";
      const user2: Email = "user2@example.com";
      const user3: Email = "user3@example.com";

      const links: ReferralLink[] = [
        createReferralLink(influencer, user1),
        createReferralLink(influencer, user2),
        createReferralLink(influencer, user3),
      ];

      const score = computeReferralScore(influencer, links);
      const referees = getReferees(influencer, links);

      expect(score).toBe(3);
      expect(referees).toHaveLength(3);
      expect(referees).toContain("user1@example.com");
      expect(referees).toContain("user2@example.com");
      expect(referees).toContain("user3@example.com");
    });
  });
});
