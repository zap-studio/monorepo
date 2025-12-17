// biome-ignore-all lint/style/noMagicNumbers: This is a test file so magic numbers are fine.

import type { Email } from "@zap-studio/validation/email/types";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { EventBus } from "../src/events";
import type { JoinSuccessResult } from "../src/sdk/types";
import { WaitlistServer } from "../src/server";
import type {
  EmailEntry,
  ReferralLink,
  WaitlistStorageAdapter,
} from "../src/types";

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
  let server: WaitlistServer;

  beforeEach(() => {
    adapter = new MockAdapter();
    eventBus = new EventBus();
    server = new WaitlistServer({ adapter, events: eventBus });
  });

  describe("constructor", () => {
    it("should create an instance of WaitlistServer", () => {
      expect(server).toBeInstanceOf(WaitlistServer);
    });

    it("should extend BaseWaitlistSDK", () => {
      // Check that it has the methods from BaseWaitlistSDK
      expect(server.join).toBeDefined();
      expect(server.remove).toBeDefined();
      expect(server.getLeaderboard).toBeDefined();
    });

    it("should accept adapter and events options", () => {
      const customServer = new WaitlistServer({ adapter, events: eventBus });
      expect(customServer).toBeInstanceOf(WaitlistServer);
    });

    it("should work without custom event bus", () => {
      const serverWithoutEvents = new WaitlistServer({ adapter });
      expect(serverWithoutEvents).toBeInstanceOf(WaitlistServer);
    });
  });

  describe("inherited join method", () => {
    it("should add users to the waitlist", async () => {
      const email = "user@example.com";
      const result = await server.join({ email });

      if (!result.ok) {
        throw new Error(result.message ?? "Expected join to succeed");
      }

      expect(result.entry.email).toBe(email);
      expect(result.entry.referralCode).toBeDefined();
      expect(result.entry.createdAt).toBeInstanceOf(Date);
    });

    it("should handle referrals", async () => {
      const referrerEmail = "referrer@example.com";
      const refereeEmail = "referee@example.com";

      const referrerResult = await server.join({ email: referrerEmail });
      if (!referrerResult.ok) {
        throw new Error(referrerResult.message ?? "Expected join to succeed");
      }
      const referralCode = referrerResult.entry.referralCode;

      const refereeResult = await server.join({
        email: refereeEmail,
        referralCode,
      });

      if (!refereeResult.ok) {
        throw new Error(refereeResult.message ?? "Expected join to succeed");
      }

      expect(refereeResult.entry.referredBy).toBe(referralCode);
      expect(refereeResult.referralLink).toBeDefined();
    });

    it("should emit events when users join", async () => {
      const handler = vi.fn();
      eventBus.on("join", handler);

      const result = await server.join({ email: "user@example.com" });
      if (!result.ok) {
        throw new Error(result.message ?? "Expected join to succeed");
      }

      expect(handler).toHaveBeenCalledWith({ email: "user@example.com" });
    });
  });

  describe("inherited remove method", () => {
    it("should remove users from the waitlist", async () => {
      const email = "user@example.com";
      const result = await server.join({ email });
      if (!result.ok) {
        throw new Error(result.message ?? "Expected join to succeed");
      }

      await server.remove(email);

      const entry = await adapter.findByEmail(email);
      expect(entry).toBeNull();
    });

    it("should emit remove event", async () => {
      const handler = vi.fn();
      eventBus.on("remove", handler);

      const email = "user@example.com";
      const result = await server.join({ email });
      if (!result.ok) {
        throw new Error(result.message ?? "Expected join to succeed");
      }
      await server.remove(email);

      expect(handler).toHaveBeenCalledWith({ email });
    });
  });

  describe("inherited getLeaderboard method", () => {
    it("should return leaderboard sorted by score", async () => {
      const userA = await server.join({ email: "userA@example.com" });
      const userB = await server.join({ email: "userB@example.com" });

      if (!(userA.ok && userB.ok)) {
        throw new Error("Expected joins to succeed");
      }

      await server.join({
        email: "userC@example.com",
        referralCode: userA.entry.referralCode,
      });
      await server.join({
        email: "userD@example.com",
        referralCode: userA.entry.referralCode,
      });
      await server.join({
        email: "userE@example.com",
        referralCode: userB.entry.referralCode,
      });

      const leaderboard = await server.getLeaderboard();

      expect(leaderboard).toHaveLength(5);
      expect(leaderboard[0]?.email).toBe("userA@example.com");
      expect(leaderboard[0]?.score).toBe(2);
      expect(leaderboard[1]?.email).toBe("userB@example.com");
      expect(leaderboard[1]?.score).toBe(1);
    });

    it("should return empty leaderboard when no users", async () => {
      const leaderboard = await server.getLeaderboard();
      expect(leaderboard).toEqual([]);
    });
  });

  describe("server-specific scenarios", () => {
    it("should handle high volume of joins", async () => {
      const promises: Promise<JoinSuccessResult>[] = [];
      for (let i = 0; i < 100; i += 1) {
        promises.push(
          server.join({ email: `user${i}@example.com` }).then((r) => {
            if (!r.ok) {
              throw new Error(r.message ?? "Expected join to succeed");
            }
            return r;
          })
        );
      }

      const results = await Promise.all(promises);

      expect(results).toHaveLength(100);
      expect(await adapter.count()).toBe(100);
    });

    it("should handle concurrent referrals", async () => {
      const referrer = await server.join({ email: "referrer@example.com" });
      if (!referrer.ok) {
        throw new Error(referrer.message ?? "Expected join to succeed");
      }
      const referralCode = referrer.entry.referralCode;

      const refereePromises: Promise<JoinSuccessResult>[] = [];
      for (let i = 0; i < 10; i += 1) {
        refereePromises.push(
          server
            .join({
              email: `referee${i}@example.com`,
              referralCode,
            })
            .then((r) => {
              if (!r.ok) {
                throw new Error(r.message ?? "Expected join to succeed");
              }
              return r;
            })
        );
      }

      await Promise.all(refereePromises);

      const count = await adapter.getReferralCount("referrer@example.com");
      expect(count).toBe(10);
    });

    it("should maintain data consistency across operations", async () => {
      // Add users
      const user1 = await server.join({ email: "user1@example.com" });
      if (!user1.ok) {
        throw new Error(user1.message ?? "Expected join to succeed");
      }
      const r2 = await server.join({ email: "user2@example.com" });
      const r3 = await server.join({
        email: "user3@example.com",
        referralCode: user1.entry.referralCode,
      });
      if (!(r2.ok && r3.ok)) {
        throw new Error("Expected joins to succeed");
      }

      // Check counts
      expect(await adapter.count()).toBe(3);
      expect(await adapter.countReferrals()).toBe(1);

      // Remove a user
      await server.remove("user2@example.com");

      // Verify consistency
      expect(await adapter.count()).toBe(2);
      expect(await adapter.countReferrals()).toBe(1);

      // Leaderboard should still work
      const leaderboard = await server.getLeaderboard();
      expect(leaderboard).toHaveLength(2);
    });

    it("should handle rapid add/remove cycles", async () => {
      const email = "user@example.com";

      for (let i = 0; i < 5; i += 1) {
        const result = await server.join({ email });
        if (!result.ok) {
          throw new Error(result.message ?? "Expected join to succeed");
        }
        await server.remove(email);
      }

      const entry = await adapter.findByEmail(email);
      expect(entry).toBeNull();
    });
  });

  describe("event handling", () => {
    it("should emit all event types correctly", async () => {
      const joinHandler = vi.fn();
      const referralHandler = vi.fn();
      const removeHandler = vi.fn();

      eventBus.on("join", joinHandler);
      eventBus.on("referral", referralHandler);
      eventBus.on("remove", removeHandler);

      const referrer = await server.join({ email: "referrer@example.com" });
      if (!referrer.ok) {
        throw new Error(referrer.message ?? "Expected join to succeed");
      }
      const referee = await server.join({
        email: "referee@example.com",
        referralCode: referrer.entry.referralCode,
      });
      if (!referee.ok) {
        throw new Error(referee.message ?? "Expected join to succeed");
      }
      await server.remove("referee@example.com");

      expect(joinHandler).toHaveBeenCalledTimes(2);
      expect(referralHandler).toHaveBeenCalledTimes(1);
      expect(removeHandler).toHaveBeenCalledTimes(1);
    });

    it("should handle event errors gracefully", async () => {
      const errorHandler = vi.fn();
      eventBus.on("error", errorHandler);

      const failingHandler = vi
        .fn()
        .mockRejectedValue(new Error("Handler error"));
      eventBus.on("join", failingHandler);

      const result = await server.join({ email: "user@example.com" });
      if (!result.ok) {
        throw new Error(result.message ?? "Expected join to succeed");
      }

      expect(errorHandler).toHaveBeenCalled();
    });
  });

  describe("integration with adapter", () => {
    it("should properly use adapter methods", async () => {
      const createSpy = vi.spyOn(adapter, "create");
      const findByEmailSpy = vi.spyOn(adapter, "findByEmail");

      const result = await server.join({ email: "user@example.com" });
      if (!result.ok) {
        throw new Error(result.message ?? "Expected join to succeed");
      }

      expect(findByEmailSpy).toHaveBeenCalledWith("user@example.com");
      expect(createSpy).toHaveBeenCalled();
    });

    it("should handle adapter errors", async () => {
      const errorAdapter = new MockAdapter();
      errorAdapter.create = vi
        .fn()
        .mockRejectedValue(new Error("Database error"));

      const errorServer = new WaitlistServer({ adapter: errorAdapter });

      await expect(
        errorServer.join({ email: "user@example.com" })
      ).rejects.toThrow("Database error");
    });
  });

  describe("edge cases", () => {
    it("should handle duplicate join attempts", async () => {
      const email = "user@example.com";
      const result1 = await server.join({ email });
      const result2 = await server.join({ email });
      if (!(result1.ok && result2.ok)) {
        throw new Error("Expected joins to succeed");
      }

      expect(result1.entry).toEqual(result2.entry);
      expect(await adapter.count()).toBe(1);
    });

    it("should handle invalid referral codes gracefully", async () => {
      const result = await server.join({
        email: "user@example.com",
        referralCode: "INVALID",
      });

      if (!result.ok) {
        throw new Error(result.message ?? "Expected join to succeed");
      }

      expect(result.entry.referredBy).toBeUndefined();
      expect(result.referralLink).toBeUndefined();
    });

    it("should handle self-referral attempts", async () => {
      const user = await server.join({ email: "user@example.com" });
      if (!user.ok) {
        throw new Error(user.message ?? "Expected join to succeed");
      }
      const referralCode = user.entry.referralCode;

      // Try to refer self - should just return existing entry
      const result = await server.join({
        email: "user@example.com",
        referralCode,
      });
      if (!result.ok) {
        throw new Error(result.message ?? "Expected join to succeed");
      }

      expect(result.entry).toEqual(user.entry);
      expect(await adapter.countReferrals()).toBe(0);
    });
  });

  describe("performance scenarios", () => {
    it("should handle large leaderboards efficiently", async () => {
      // Create many users
      for (let i = 0; i < 50; i += 1) {
        const result = await server.join({ email: `user${i}@example.com` });
        if (!result.ok) {
          throw new Error(result.message ?? "Expected join to succeed");
        }
      }

      const start = Date.now();
      const leaderboard = await server.getLeaderboard();
      const duration = Date.now() - start;

      expect(leaderboard).toHaveLength(50);
      expect(duration).toBeLessThan(1000); // Should complete in under 1 second
    });

    it("should handle complex referral networks", async () => {
      const users: JoinSuccessResult[] = [];

      // Create 10 initial users
      for (let i = 0; i < 10; i += 1) {
        const user = await server.join({ email: `user${i}@example.com` });
        if (!user.ok) {
          throw new Error(user.message ?? "Expected join to succeed");
        }
        users.push(user);
      }

      // Each user refers 3 new users
      for (let i = 0; i < 10; i += 1) {
        for (let j = 0; j < 3; j += 1) {
          await server.join({
            email: `referee${i}-${j}@example.com`,
            referralCode: users[i]?.entry.referralCode,
          });
        }
      }

      const leaderboard = await server.getLeaderboard();
      expect(leaderboard).toHaveLength(40); // 10 initial + 30 referees

      // All initial users should have score of 3
      for (let i = 0; i < 10; i += 1) {
        expect(leaderboard[i]?.score).toBe(3);
      }
    });
  });
});
