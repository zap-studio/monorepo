// biome-ignore-all lint/style/noMagicNumbers: This is a test file so magic numbers are fine.

import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryAdapter } from "../../src/adapters/storage/in-memory";
import type { ReferralLink } from "../../src/referral/types";
import type { EmailEntry } from "../../src/types";

describe("InMemoryAdapter", () => {
  let adapter: InMemoryAdapter;

  beforeEach(() => {
    adapter = new InMemoryAdapter();
  });

  describe("Email Entry Operations", () => {
    it("can create and find an entry by email", async () => {
      const entry: EmailEntry = {
        email: "a@test.com",
        createdAt: new Date(),
      };
      await adapter.create(entry);
      const found = await adapter.findByEmail(entry.email);
      expect(found).toEqual(entry);
    });

    it("returns null when email is not found", async () => {
      const found = await adapter.findByEmail("nonexistent@test.com");
      expect(found).toBeNull();
    });

    it("can create entry with referral code", async () => {
      const entry: EmailEntry = {
        email: "b@test.com",
        createdAt: new Date(),
        referralCode: "REF-123",
      };
      await adapter.create(entry);
      const found = await adapter.findByEmail(entry.email);
      expect(found?.referralCode).toBe("REF-123");
    });

    it("can create entry with referredBy code", async () => {
      const entry: EmailEntry = {
        email: "c@test.com",
        createdAt: new Date(),
        referredBy: "REF-456",
      };
      await adapter.create(entry);
      const found = await adapter.findByEmail(entry.email);
      expect(found?.referredBy).toBe("REF-456");
    });

    it("can create entry with metadata", async () => {
      const entry: EmailEntry = {
        email: "d@test.com",
        createdAt: new Date(),
        meta: { source: "landing-page", campaign: "summer2024" },
      };
      await adapter.create(entry);
      const found = await adapter.findByEmail(entry.email);
      expect(found?.meta).toEqual({
        source: "landing-page",
        campaign: "summer2024",
      });
    });

    it("can update an entry", async () => {
      const entry: EmailEntry = {
        email: "e@test.com",
        createdAt: new Date(),
      };
      await adapter.create(entry);
      const updated = await adapter.update(entry.email, {
        referralCode: "NEW-CODE",
      });
      expect(updated.referralCode).toBe("NEW-CODE");
      expect(updated.email).toBe("e@test.com");
    });

    it("throws error when updating non-existent entry", async () => {
      await expect(
        adapter.update("nonexistent@test.com", { referralCode: "CODE" })
      ).rejects.toThrow("Entry not found");
    });

    it("can delete an entry", async () => {
      const entry: EmailEntry = {
        email: "f@test.com",
        createdAt: new Date(),
      };
      await adapter.create(entry);
      await adapter.delete(entry.email);
      const found = await adapter.findByEmail(entry.email);
      expect(found).toBeNull();
    });

    it("can find entry by referral code", async () => {
      const entry: EmailEntry = {
        email: "g@test.com",
        createdAt: new Date(),
        referralCode: "UNIQUE-CODE",
      };
      await adapter.create(entry);
      const found = await adapter.findByReferralCode("UNIQUE-CODE");
      expect(found?.email).toBe("g@test.com");
    });

    it("returns null when referral code is not found", async () => {
      const found = await adapter.findByReferralCode("NON-EXISTENT");
      expect(found).toBeNull();
    });
  });

  describe("List Operations", () => {
    it("can list all entries", async () => {
      const entry1: EmailEntry = {
        email: "list1@test.com",
        createdAt: new Date(),
      };
      const entry2: EmailEntry = {
        email: "list2@test.com",
        createdAt: new Date(),
      };
      await adapter.create(entry1);
      await adapter.create(entry2);

      const list = await adapter.list();
      expect(list).toHaveLength(2);
      expect(list).toContainEqual(entry1);
      expect(list).toContainEqual(entry2);
    });

    it("returns empty array when no entries exist", async () => {
      const list = await adapter.list();
      expect(list).toEqual([]);
    });

    it("can list all emails", async () => {
      await adapter.create({
        email: "email1@test.com",
        createdAt: new Date(),
      });
      await adapter.create({
        email: "email2@test.com",
        createdAt: new Date(),
      });

      const emails = await adapter.listEmails();
      expect(emails).toHaveLength(2);
      expect(emails).toContain("email1@test.com");
      expect(emails).toContain("email2@test.com");
    });

    it("can count entries", async () => {
      expect(await adapter.count()).toBe(0);

      await adapter.create({
        email: "count1@test.com",
        createdAt: new Date(),
      });
      expect(await adapter.count()).toBe(1);

      await adapter.create({
        email: "count2@test.com",
        createdAt: new Date(),
      });
      expect(await adapter.count()).toBe(2);
    });
  });

  describe("Referral Link Operations", () => {
    it("can create a referral link", async () => {
      const link: ReferralLink = {
        referrer: "referrer@test.com",
        referee: "referee@test.com",
        createdAt: new Date(),
      };
      const created = await adapter.createReferral(link);
      expect(created).toEqual(link);
    });

    it("can update a referral link", async () => {
      const link: ReferralLink = {
        referrer: "referrer@test.com",
        referee: "referee@test.com",
        createdAt: new Date(),
      };
      await adapter.createReferral(link);

      const newDate = new Date("2025-01-01");
      const updated = await adapter.updateReferral(
        { referrer: link.referrer, referee: link.referee },
        { createdAt: newDate }
      );
      expect(updated.createdAt).toEqual(newDate);
    });

    it("throws error when updating non-existent referral link", async () => {
      await expect(
        adapter.updateReferral(
          { referrer: "nobody@test.com", referee: "nobody2@test.com" },
          { createdAt: new Date() }
        )
      ).rejects.toThrow("Referral not found");
    });

    it("can delete a referral link", async () => {
      const link: ReferralLink = {
        referrer: "delete-ref@test.com",
        referee: "delete-fee@test.com",
        createdAt: new Date(),
      };
      await adapter.createReferral(link);

      await adapter.deleteReferral({
        referrer: link.referrer,
        referee: link.referee,
      });

      const count = await adapter.getReferralCount(link.referrer);
      expect(count).toBe(0);
    });

    it("can get referral count for an email", async () => {
      const referrer = "popular@test.com";

      expect(await adapter.getReferralCount(referrer)).toBe(0);

      await adapter.createReferral({
        referrer,
        referee: "ref1@test.com",
        createdAt: new Date(),
      });
      expect(await adapter.getReferralCount(referrer)).toBe(1);

      await adapter.createReferral({
        referrer,
        referee: "ref2@test.com",
        createdAt: new Date(),
      });
      expect(await adapter.getReferralCount(referrer)).toBe(2);

      await adapter.createReferral({
        referrer,
        referee: "ref3@test.com",
        createdAt: new Date(),
      });
      expect(await adapter.getReferralCount(referrer)).toBe(3);
    });

    it("can list all referral links", async () => {
      const link1: ReferralLink = {
        referrer: "referrer1@test.com",
        referee: "referee1@test.com",
        createdAt: new Date(),
      };
      const link2: ReferralLink = {
        referrer: "referrer2@test.com",
        referee: "referee2@test.com",
        createdAt: new Date(),
      };

      await adapter.createReferral(link1);
      await adapter.createReferral(link2);

      const links = await adapter.listReferrals();
      expect(links).toHaveLength(2);
      expect(links).toContainEqual(link1);
      expect(links).toContainEqual(link2);
    });

    it("returns empty array when no referrals exist", async () => {
      const links = await adapter.listReferrals();
      expect(links).toEqual([]);
    });

    it("can count referral links", async () => {
      expect(await adapter.countReferrals()).toBe(0);

      await adapter.createReferral({
        referrer: "ref1@test.com",
        referee: "fee1@test.com",
        createdAt: new Date(),
      });
      expect(await adapter.countReferrals()).toBe(1);

      await adapter.createReferral({
        referrer: "ref2@test.com",
        referee: "fee2@test.com",
        createdAt: new Date(),
      });
      expect(await adapter.countReferrals()).toBe(2);
    });
  });

  describe("Leaderboard", () => {
    it("can get leaderboard sorted by score", async () => {
      // Create entries
      await adapter.create({
        email: "user1@test.com",
        createdAt: new Date(),
        referralCode: "CODE1",
      });
      await adapter.create({
        email: "user2@test.com",
        createdAt: new Date(),
        referralCode: "CODE2",
      });
      await adapter.create({
        email: "user3@test.com",
        createdAt: new Date(),
        referralCode: "CODE3",
      });

      // Create referrals - user2 has most referrals
      await adapter.createReferral({
        referrer: "user2@test.com",
        referee: "referee1@test.com",
        createdAt: new Date(),
      });
      await adapter.createReferral({
        referrer: "user2@test.com",
        referee: "referee2@test.com",
        createdAt: new Date(),
      });
      await adapter.createReferral({
        referrer: "user1@test.com",
        referee: "referee3@test.com",
        createdAt: new Date(),
      });

      const leaderboard = await adapter.getLeaderboard();

      expect(leaderboard).toHaveLength(3);
      // user2 should be first with 2 referrals
      expect(leaderboard[0]?.email).toBe("user2@test.com");
      expect(leaderboard[0]?.score).toBeGreaterThan(0);
      // user1 should be second with 1 referral
      expect(leaderboard[1]?.email).toBe("user1@test.com");
      // user3 should be last with 0 referrals
      expect(leaderboard[2]?.email).toBe("user3@test.com");
      expect(leaderboard[2]?.score).toBe(0);
    });

    it("returns empty leaderboard when no entries exist", async () => {
      const leaderboard = await adapter.getLeaderboard();
      expect(leaderboard).toEqual([]);
    });

    it("leaderboard scores are properly sorted", async () => {
      await adapter.create({
        email: "top@test.com",
        createdAt: new Date(),
      });
      await adapter.create({
        email: "bottom@test.com",
        createdAt: new Date(),
      });

      // Give top user more referrals
      for (let i = 0; i < 5; i += 1) {
        await adapter.createReferral({
          referrer: "top@test.com",
          referee: `referee${i}@test.com`,
          createdAt: new Date(),
        });
      }

      const leaderboard = await adapter.getLeaderboard();
      // Verify scores are in descending order
      for (let i = 0; i < leaderboard.length - 1; i += 1) {
        expect(leaderboard[i]?.score).toBeGreaterThanOrEqual(
          leaderboard[i + 1]?.score ?? 0
        );
      }
    });
  });

  describe("Edge Cases", () => {
    it("handles multiple operations on same entry", async () => {
      const entry: EmailEntry = {
        email: "edge@test.com",
        createdAt: new Date(),
      };

      await adapter.create(entry);
      await adapter.update(entry.email, { referralCode: "CODE1" });
      await adapter.update(entry.email, { referredBy: "CODE2" });
      await adapter.update(entry.email, { meta: { test: true } });

      const found = await adapter.findByEmail(entry.email);
      expect(found?.referralCode).toBe("CODE1");
      expect(found?.referredBy).toBe("CODE2");
      expect(found?.meta).toEqual({ test: true });
    });

    it("maintains separate referral relationships correctly", async () => {
      // User A refers B and C
      await adapter.createReferral({
        referrer: "userA@test.com",
        referee: "userB@test.com",
        createdAt: new Date(),
      });
      await adapter.createReferral({
        referrer: "userA@test.com",
        referee: "userC@test.com",
        createdAt: new Date(),
      });

      // User B refers D
      await adapter.createReferral({
        referrer: "userB@test.com",
        referee: "userD@test.com",
        createdAt: new Date(),
      });

      expect(await adapter.getReferralCount("userA@test.com")).toBe(2);
      expect(await adapter.getReferralCount("userB@test.com")).toBe(1);
      expect(await adapter.getReferralCount("userC@test.com")).toBe(0);
      expect(await adapter.getReferralCount("userD@test.com")).toBe(0);
    });

    it("deleting entry doesn't affect referral links", async () => {
      const referrer = "delete-me@test.com";

      await adapter.create({
        email: referrer,
        createdAt: new Date(),
      });

      await adapter.createReferral({
        referrer,
        referee: "someone@test.com",
        createdAt: new Date(),
      });

      await adapter.delete(referrer);

      // Referral link should still exist even though entry is deleted
      expect(await adapter.getReferralCount(referrer)).toBe(1);
    });
  });
});
