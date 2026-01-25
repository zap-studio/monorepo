// biome-ignore-all lint/style/noMagicNumbers: This is a test file so magic numbers are fine.

import type { Email } from "@zap-studio/validation/email/types";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { WaitlistStorageAdapter } from "../src/adapters/storage/types";
import { EventBus } from "../src/events";
import { WaitlistServer } from "../src/server";
import type { EmailEntry, JoinSuccessResult, ReferralLink } from "../src/types";

// Mock adapter implementation for testing
class MockAdapter implements WaitlistStorageAdapter {
  private readonly entries = new Map<Email, EmailEntry>();
  private readonly referrals = new Map<string, ReferralLink>();

  private getReferralKey(referrer: Email, referee: Email): string {
    return `${referrer}:${referee}`;
  }

  async create(entry: EmailEntry): Promise<EmailEntry> {
    this.entries.set(entry.email, entry);
    return await Promise.resolve(entry);
  }

  async createReferral(link: ReferralLink): Promise<ReferralLink> {
    const key = this.getReferralKey(link.referrer, link.referee);
    this.referrals.set(key, link);
    return await Promise.resolve(link);
  }

  async update(email: Email, patch: Partial<EmailEntry>): Promise<EmailEntry> {
    const existing = this.entries.get(email);
    if (!existing) {
      throw new Error("Entry not found");
    }
    const updated = { ...existing, ...patch };
    this.entries.set(email, updated);
    return await Promise.resolve(updated);
  }

  async updateReferral(
    key: { referrer: Email; referee: Email },
    patch: Partial<ReferralLink>
  ): Promise<ReferralLink> {
    const referralKey = this.getReferralKey(key.referrer, key.referee);
    const existing = this.referrals.get(referralKey);
    if (!existing) {
      throw new Error("Referral not found");
    }
    const updated = { ...existing, ...patch };
    this.referrals.set(referralKey, updated);
    return await Promise.resolve(updated);
  }

  async delete(email: Email): Promise<void> {
    await Promise.resolve(this.entries.delete(email));
  }

  async deleteReferral(key: {
    referrer: Email;
    referee: Email;
  }): Promise<void> {
    const referralKey = this.getReferralKey(key.referrer, key.referee);
    await Promise.resolve(this.referrals.delete(referralKey));
  }

  async findByEmail(email: Email): Promise<EmailEntry | null> {
    return await Promise.resolve(this.entries.get(email) ?? null);
  }

  async findByReferralCode(code: string): Promise<EmailEntry | null> {
    for (const entry of this.entries.values()) {
      if (entry.referralCode === code) {
        return entry;
      }
    }
    return await Promise.resolve(null);
  }

  async getReferralCount(email: Email): Promise<number> {
    let count = 0;
    for (const referral of this.referrals.values()) {
      if (referral.referrer === email) {
        count += 1;
      }
    }
    return await Promise.resolve(count);
  }

  async list(): Promise<EmailEntry[]> {
    return await Promise.resolve(Array.from(this.entries.values()));
  }

  async listEmails(): Promise<Email[]> {
    return await Promise.resolve(Array.from(this.entries.keys()));
  }

  async listReferrals(): Promise<ReferralLink[]> {
    return await Promise.resolve(Array.from(this.referrals.values()));
  }

  async count(): Promise<number> {
    return await Promise.resolve(this.entries.size);
  }

  async countReferrals(): Promise<number> {
    return await Promise.resolve(this.referrals.size);
  }
}

describe("WaitlistServer", () => {
  let adapter: MockAdapter;
  let eventBus: EventBus;
  let sdk: WaitlistServer;

  beforeEach(() => {
    adapter = new MockAdapter();
    eventBus = new EventBus();
    sdk = new WaitlistServer({ adapter, events: eventBus });
  });

  describe("constructor", () => {
    it("should create an instance with adapter and events", () => {
      expect(sdk).toBeInstanceOf(WaitlistServer);
    });

    it("should create a default EventBus if not provided", () => {
      const sdkWithoutEvents = new WaitlistServer({ adapter });
      expect(sdkWithoutEvents).toBeInstanceOf(WaitlistServer);
    });
  });

  describe("join", () => {
    it("should add a new user to the waitlist", async () => {
      const email = "user@example.com";
      const result = await sdk.join({ email });

      if (!result.ok) {
        throw new Error(result.message ?? "Expected join to succeed");
      }

      expect(result.entry.email).toBe(email);
      expect(result.entry.referralCode).toBeDefined();
      expect(result.entry.createdAt).toBeInstanceOf(Date);
      expect(result.referralLink).toBeUndefined();
    });

    it("should emit join event when user joins", async () => {
      const handler = vi.fn();
      eventBus.on("join", handler);

      const email = "user@example.com";
      const result = await sdk.join({ email });

      if (!result.ok) {
        throw new Error(result.message ?? "Expected join to succeed");
      }

      expect(handler).toHaveBeenCalledWith({ email });
      expect(handler).toHaveBeenCalledTimes(1);
    });

    it("should return existing entry if user already exists", async () => {
      const email = "user@example.com";

      const firstResult = await sdk.join({ email });
      const secondResult = await sdk.join({ email });
      if (!(firstResult.ok && secondResult.ok)) {
        throw new Error("Expected both joins to succeed");
      }

      expect(secondResult.entry).toEqual(firstResult.entry);
    });

    it("should not emit join event if user already exists", async () => {
      const handler = vi.fn();
      eventBus.on("join", handler);

      const email = "user@example.com";
      const first = await sdk.join({ email });
      const second = await sdk.join({ email });
      if (!(first.ok && second.ok)) {
        throw new Error("Expected joins to succeed");
      }

      expect(handler).toHaveBeenCalledTimes(1);
    });

    it("should track referral when valid referral code provided", async () => {
      const referrerEmail = "referrer@example.com";
      const refereeEmail = "referee@example.com";

      // First user joins
      const referrerResult = await sdk.join({ email: referrerEmail });
      if (!referrerResult.ok) {
        throw new Error(referrerResult.message ?? "Expected join to succeed");
      }
      const referralCode = referrerResult.entry.referralCode;

      // Second user joins with referral code
      const refereeResult = await sdk.join({
        email: refereeEmail,
        referralCode,
      });

      if (!refereeResult.ok) {
        throw new Error(refereeResult.message ?? "Expected join to succeed");
      }

      expect(refereeResult.entry.referredBy).toBe(referralCode);
      expect(refereeResult.referralLink).toBeDefined();
      expect(refereeResult.referralLink?.referrer).toBe(referrerEmail);
      expect(refereeResult.referralLink?.referee).toBe(refereeEmail);
    });

    it("should emit both join and referral events when referral is used", async () => {
      const joinHandler = vi.fn();
      const referralHandler = vi.fn();
      eventBus.on("join", joinHandler);
      eventBus.on("referral", referralHandler);

      const referrerEmail = "referrer@example.com";
      const refereeEmail = "referee@example.com";

      const referrerResult = await sdk.join({ email: referrerEmail });
      if (!referrerResult.ok) {
        throw new Error(referrerResult.message ?? "Expected join to succeed");
      }
      const referralCode = referrerResult.entry.referralCode;

      await sdk.join({ email: refereeEmail, referralCode });

      expect(joinHandler).toHaveBeenCalledTimes(2);
      expect(referralHandler).toHaveBeenCalledWith({
        referrer: referrerEmail,
        referee: refereeEmail,
      });
    });

    it("should not track referral with invalid referral code", async () => {
      const email = "user@example.com";
      const result = await sdk.join({
        email,
        referralCode: "INVALID-CODE",
      });

      if (!result.ok) {
        throw new Error(result.message ?? "Expected join to succeed");
      }

      expect(result.entry.referredBy).toBeUndefined();
      expect(result.referralLink).toBeUndefined();
    });

    it("should not emit referral event with invalid referral code", async () => {
      const referralHandler = vi.fn();
      eventBus.on("referral", referralHandler);

      const email = "user@example.com";
      const result = await sdk.join({ email, referralCode: "INVALID-CODE" });
      if (!result.ok) {
        throw new Error(result.message ?? "Expected join to succeed");
      }

      expect(referralHandler).not.toHaveBeenCalled();
    });

    it("should generate unique referral codes for different users", async () => {
      const result1 = await sdk.join({ email: "user1@example.com" });
      const result2 = await sdk.join({ email: "user2@example.com" });

      if (!(result1.ok && result2.ok)) {
        throw new Error("Expected joins to succeed");
      }

      expect(result1.entry.referralCode).not.toBe(result2.entry.referralCode);
    });
  });

  describe("remove", () => {
    it("should remove a user from the waitlist", async () => {
      const email = "user@example.com";
      await sdk.join({ email });

      await sdk.remove(email);

      const entry = await adapter.findByEmail(email);
      expect(entry).toBeNull();
    });

    it("should emit remove event when user is removed", async () => {
      const handler = vi.fn();
      eventBus.on("remove", handler);

      const email = "user@example.com";
      await sdk.join({ email });
      await sdk.remove(email);

      expect(handler).toHaveBeenCalledWith({ email });
    });

    it("should not throw error when removing non-existent user", async () => {
      await expect(
        sdk.remove("nonexistent@example.com")
      ).resolves.not.toThrow();
    });
  });

  describe("getLeaderboard", () => {
    it("should return empty leaderboard when no users", async () => {
      const leaderboard = await sdk.getLeaderboard();

      expect(leaderboard).toEqual([]);
    });

    it("should return leaderboard sorted by referral score", async () => {
      // User A joins
      const userA = await sdk.join({ email: "userA@example.com" });
      if (!userA.ok) {
        throw new Error(userA.message ?? "Expected join to succeed");
      }
      const codeA = userA.entry.referralCode;

      // User B joins
      const userB = await sdk.join({ email: "userB@example.com" });
      if (!userB.ok) {
        throw new Error(userB.message ?? "Expected join to succeed");
      }
      const codeB = userB.entry.referralCode;

      // User C joins with A's code (A has 1 referral)
      await sdk.join({ email: "userC@example.com", referralCode: codeA });

      // User D joins with A's code (A has 2 referrals)
      await sdk.join({ email: "userD@example.com", referralCode: codeA });

      // User E joins with B's code (B has 1 referral)
      await sdk.join({ email: "userE@example.com", referralCode: codeB });

      const leaderboard = await sdk.getLeaderboard();

      expect(leaderboard).toHaveLength(5);
      expect(leaderboard[0]?.email).toBe("userA@example.com");
      expect(leaderboard[0]?.score).toBe(2);
      expect(leaderboard[1]?.email).toBe("userB@example.com");
      expect(leaderboard[1]?.score).toBe(1);
      expect(leaderboard[2]?.score).toBe(0);
      expect(leaderboard[3]?.score).toBe(0);
      expect(leaderboard[4]?.score).toBe(0);
    });

    it("should use adapter's getLeaderboard if available", async () => {
      const mockLeaderboard = [
        { email: "user1@example.com", score: 10 },
        { email: "user2@example.com", score: 5 },
      ];

      (
        adapter as MockAdapter & {
          getLeaderboard?: () => Promise<typeof mockLeaderboard>;
        }
      ).getLeaderboard = vi.fn().mockResolvedValue(mockLeaderboard);

      const leaderboard = await sdk.getLeaderboard();

      expect(
        (
          adapter as MockAdapter & {
            getLeaderboard?: () => Promise<typeof mockLeaderboard>;
          }
        ).getLeaderboard
      ).toHaveBeenCalled();
      expect(leaderboard).toEqual(mockLeaderboard);
    });

    it("should handle users with same score", async () => {
      const r1 = await sdk.join({ email: "user1@example.com" });
      const r2 = await sdk.join({ email: "user2@example.com" });
      const r3 = await sdk.join({ email: "user3@example.com" });
      if (!(r1.ok && r2.ok && r3.ok)) {
        throw new Error("Expected joins to succeed");
      }

      const leaderboard = await sdk.getLeaderboard();

      expect(leaderboard).toHaveLength(3);
      expect(leaderboard[0]?.score).toBe(0);
      expect(leaderboard[1]?.score).toBe(0);
      expect(leaderboard[2]?.score).toBe(0);
    });
  });

  describe("integration scenarios", () => {
    it("should handle complex referral chain", async () => {
      // User A joins
      const userA = await sdk.join({ email: "userA@example.com" });
      if (!userA.ok) {
        throw new Error(userA.message ?? "Expected join to succeed");
      }

      // User B joins with A's code
      await sdk.join({
        email: "userB@example.com",
        referralCode: userA.entry.referralCode,
      });

      // User C joins with A's code
      await sdk.join({
        email: "userC@example.com",
        referralCode: userA.entry.referralCode,
      });

      const count = await adapter.getReferralCount("userA@example.com");
      expect(count).toBe(2);
    });

    it("should handle multiple users with different referral counts", async () => {
      const users: JoinSuccessResult[] = [];

      // Create 5 users
      for (let i = 1; i <= 5; i += 1) {
        const result = await sdk.join({ email: `user${i}@example.com` });
        if (!result.ok) {
          throw new Error(result.message ?? "Expected join to succeed");
        }
        users.push(result);
      }

      // User 1 gets 3 referrals
      for (let i = 6; i <= 8; i += 1) {
        await sdk.join({
          email: `user${i}@example.com`,
          referralCode: users[0]?.entry.referralCode,
        });
      }

      // User 2 gets 2 referrals
      for (let i = 9; i <= 10; i += 1) {
        await sdk.join({
          email: `user${i}@example.com`,
          referralCode: users[1]?.entry.referralCode,
        });
      }

      const leaderboard = await sdk.getLeaderboard();

      expect(leaderboard[0]?.email).toBe("user1@example.com");
      expect(leaderboard[0]?.score).toBe(3);
      expect(leaderboard[1]?.email).toBe("user2@example.com");
      expect(leaderboard[1]?.score).toBe(2);
    });

    it("should maintain referral links after remove", async () => {
      const referrer = await sdk.join({ email: "referrer@example.com" });
      if (!referrer.ok) {
        throw new Error(referrer.message ?? "Expected join to succeed");
      }
      await sdk.join({
        email: "referee@example.com",
        referralCode: referrer.entry.referralCode,
      });

      const referrals = await adapter.listReferrals();
      expect(referrals).toHaveLength(1);

      // Remove referee
      await sdk.remove("referee@example.com");

      // Referral link should still exist
      const referralsAfter = await adapter.listReferrals();
      expect(referralsAfter).toHaveLength(1);
    });
  });

  describe("error handling", () => {
    it("should handle adapter errors gracefully", async () => {
      const errorAdapter = new MockAdapter();
      errorAdapter.create = vi
        .fn()
        .mockRejectedValue(new Error("Database error"));

      const errorSdk = new WaitlistServer({ adapter: errorAdapter });

      await expect(
        errorSdk.join({ email: "user@example.com" })
      ).rejects.toThrow("Database error");
    });

    it("should emit error event when handler fails", async () => {
      const errorHandler = vi.fn();
      eventBus.on("error", errorHandler);

      const failingHandler = vi
        .fn()
        .mockRejectedValue(new Error("Handler error"));
      eventBus.on("join", failingHandler);

      await sdk.join({ email: "user@example.com" });

      expect(errorHandler).toHaveBeenCalledWith({
        err: expect.any(Error),
        source: "join",
      });
    });
  });
});
