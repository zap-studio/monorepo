// biome-ignore-all lint/style/noMagicNumbers: This is a test file so magic numbers are fine.

import { beforeEach, describe, expect, it, vi } from "vitest";
import { WaitlistClient } from "../src/client";

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("WaitlistClient", () => {
  let client: WaitlistClient;
  const baseUrl = "http://localhost:3000";

  beforeEach(() => {
    client = new WaitlistClient({ baseUrl });
    mockFetch.mockClear();
  });

  describe("constructor", () => {
    it("should create an instance with baseUrl", () => {
      expect(client).toBeInstanceOf(WaitlistClient);
      expect(client.baseUrl).toBe(baseUrl);
    });

    it("should accept custom baseUrl", () => {
      const customClient = new WaitlistClient({
        baseUrl: "https://api.example.com",
      });
      expect(customClient.baseUrl).toBe("https://api.example.com");
    });
  });

  describe("join", () => {
    it("should make POST request to join endpoint", async () => {
      const email = "user@example.com";
      const mockResponse = {
        entry: {
          email,
          createdAt: new Date().toISOString(),
          referralCode: "ABC-123",
        },
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await client.join(email);

      expect(mockFetch).toHaveBeenCalledWith(`${baseUrl}/api/waitlist/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, referralCode: undefined }),
      });
      expect(result).toEqual(mockResponse);
    });

    it("should include referral code when provided", async () => {
      const email = "user@example.com";
      const referralCode = "REF-123";
      const mockResponse = {
        entry: {
          email,
          createdAt: new Date().toISOString(),
          referralCode: "ABC-123",
          referredBy: referralCode,
        },
        referralLink: {
          referrer: "referrer@example.com",
          referee: email,
          createdAt: new Date().toISOString(),
        },
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await client.join(email, referralCode);

      expect(mockFetch).toHaveBeenCalledWith(`${baseUrl}/api/waitlist/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, referralCode }),
      });
      expect(result).toEqual(mockResponse);
    });

    it("should throw error when request fails", async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 400,
        statusText: "Bad Request",
      });

      await expect(client.join("invalid-email")).rejects.toThrow(
        "Failed to join waitlist"
      );
    });

    it("should handle network errors", async () => {
      mockFetch.mockRejectedValue(new Error("Network error"));

      await expect(client.join("user@example.com")).rejects.toThrow(
        "Network error"
      );
    });

    it("should handle server errors", async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
      });

      await expect(client.join("user@example.com")).rejects.toThrow(
        "Failed to join waitlist"
      );
    });

    it("should use correct endpoint path", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ entry: {} }),
      });

      await client.join("user@example.com");

      expect(mockFetch).toHaveBeenCalledWith(
        `${baseUrl}/api/waitlist/join`,
        expect.any(Object)
      );
    });
  });

  describe("getLeaderboard", () => {
    it("should make GET request to leaderboard endpoint", async () => {
      const mockLeaderboard = [
        { email: "user1@example.com", score: 10 },
        { email: "user2@example.com", score: 5 },
        { email: "user3@example.com", score: 2 },
      ];

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockLeaderboard,
      });

      const result = await client.getLeaderboard();

      expect(mockFetch).toHaveBeenCalledWith(
        `${baseUrl}/api/waitlist/leaderboard`
      );
      expect(result).toEqual(mockLeaderboard);
    });

    it("should throw error when request fails", async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 404,
        statusText: "Not Found",
      });

      await expect(client.getLeaderboard()).rejects.toThrow(
        "Failed to fetch leaderboard"
      );
    });

    it("should handle empty leaderboard", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => [],
      });

      const result = await client.getLeaderboard();

      expect(result).toEqual([]);
    });

    it("should handle network errors", async () => {
      mockFetch.mockRejectedValue(new Error("Network error"));

      await expect(client.getLeaderboard()).rejects.toThrow("Network error");
    });

    it("should use correct endpoint path", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => [],
      });

      await client.getLeaderboard();

      expect(mockFetch).toHaveBeenCalledWith(
        `${baseUrl}/api/waitlist/leaderboard`
      );
    });
  });

  describe("integration scenarios", () => {
    it("should handle multiple join requests", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ entry: {} }),
      });

      await client.join("user1@example.com");
      await client.join("user2@example.com");
      await client.join("user3@example.com");

      expect(mockFetch).toHaveBeenCalledTimes(3);
    });

    it("should work with different base URLs", async () => {
      const client1 = new WaitlistClient({ baseUrl: "http://localhost:3000" });
      const client2 = new WaitlistClient({
        baseUrl: "https://api.production.com",
      });

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ entry: {} }),
      });

      await client1.join("user@example.com");
      await client2.join("user@example.com");

      expect(mockFetch).toHaveBeenNthCalledWith(
        1,
        "http://localhost:3000/api/waitlist/join",
        expect.any(Object)
      );
      expect(mockFetch).toHaveBeenNthCalledWith(
        2,
        "https://api.production.com/api/waitlist/join",
        expect.any(Object)
      );
    });

    it("should handle sequential operations", async () => {
      // First join
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          entry: { email: "user@example.com", referralCode: "ABC-123" },
        }),
      });

      await client.join("user@example.com");

      // Then get leaderboard
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [{ email: "user@example.com", score: 0 }],
      });

      await client.getLeaderboard();

      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });

  describe("error handling", () => {
    it("should include response in error cause", async () => {
      const mockResponse = {
        ok: false,
        status: 400,
        statusText: "Bad Request",
      };

      mockFetch.mockResolvedValue(mockResponse);

      try {
        await client.join("user@example.com");
        expect.fail("Should have thrown error");
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Failed to join waitlist");
        expect((err as Error).cause).toBe(mockResponse);
      }
    });

    it("should handle JSON parse errors", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => {
          throw new Error("Invalid JSON");
        },
      });

      await expect(client.join("user@example.com")).rejects.toThrow(
        "Invalid JSON"
      );
    });

    it("should handle timeout errors", async () => {
      mockFetch.mockImplementation(
        () =>
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Timeout")), 100)
          )
      );

      await expect(client.join("user@example.com")).rejects.toThrow("Timeout");
    });
  });

  describe("edge cases", () => {
    it("should handle special characters in email", async () => {
      const email = "user+tag@example.com";

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ entry: { email } }),
      });

      await client.join(email);

      expect(mockFetch).toHaveBeenCalledWith(
        `${baseUrl}/api/waitlist/join`,
        expect.objectContaining({
          body: JSON.stringify({ email, referralCode: undefined }),
        })
      );
    });

    it("should handle very long referral codes", async () => {
      const referralCode = "A".repeat(100);

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ entry: {} }),
      });

      await client.join("user@example.com", referralCode);

      expect(mockFetch).toHaveBeenCalledWith(
        `${baseUrl}/api/waitlist/join`,
        expect.objectContaining({
          body: JSON.stringify({
            email: "user@example.com",
            referralCode,
          }),
        })
      );
    });

    it("should handle baseUrl with trailing slash", () => {
      const clientWithSlash = new WaitlistClient({
        baseUrl: "http://localhost:3000/",
      });

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ entry: {} }),
      });

      clientWithSlash.join("user@example.com");

      expect(mockFetch).toHaveBeenCalledWith(
        "http://localhost:3000//api/waitlist/join",
        expect.any(Object)
      );
    });
  });
});
