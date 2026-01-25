// biome-ignore-all lint/style/noMagicNumbers: This is a test file so magic numbers are fine.

import { FetchError } from "@zap-studio/fetch/errors";
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

    it("should accept custom prefix", async () => {
      const customClient = new WaitlistClient({
        baseUrl,
        prefix: "/v1/waitlist/",
      });

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          ok: true,
          entry: {
            email: "user@example.com",
            createdAt: new Date().toISOString(),
            referralCode: "ABC",
          },
        }),
      });

      await customClient.join({ email: "user@example.com" });

      expect(mockFetch).toHaveBeenCalledWith(
        `${baseUrl}/v1/waitlist/join`,
        expect.any(Object)
      );
    });
  });

  describe("join", () => {
    it("should make POST request to join endpoint", async () => {
      const email = "user@example.com";
      const mockResponse = {
        ok: true,
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

      const result = await client.join({ email });

      expect(mockFetch).toHaveBeenCalledWith(
        `${baseUrl}/api/waitlist/join`,
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ email, referralCode: undefined }),
        })
      );
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.entry.email).toBe(email);
        expect(result.entry.referralCode).toBe("ABC-123");
        expect(result.entry.createdAt).toBeInstanceOf(Date);
      }
    });

    it("should include referral code when provided", async () => {
      const email = "user@example.com";
      const referralCode = "REF-123";
      const mockResponse = {
        ok: true,
        entry: {
          email,
          createdAt: new Date().toISOString(),
          referralCode: "ABC-123",
          referredBy: referralCode,
        },
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await client.join({ email, referralCode });

      expect(mockFetch).toHaveBeenCalledWith(
        `${baseUrl}/api/waitlist/join`,
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ email, referralCode }),
        })
      );
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.entry.email).toBe(email);
        expect(result.entry.referralCode).toBe("ABC-123");
      }
    });

    it("should throw FetchError when request fails", async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 400,
        statusText: "Bad Request",
      });

      await expect(client.join({ email: "invalid-email" })).rejects.toThrow(
        FetchError
      );
      await expect(client.join({ email: "invalid-email" })).rejects.toThrow(
        "HTTP 400: Bad Request"
      );
    });

    it("should handle network errors", async () => {
      mockFetch.mockRejectedValue(new Error("Network error"));

      await expect(client.join({ email: "user@example.com" })).rejects.toThrow(
        "Network error"
      );
    });

    it("should handle server errors", async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
      });

      await expect(client.join({ email: "user@example.com" })).rejects.toThrow(
        FetchError
      );
      await expect(client.join({ email: "user@example.com" })).rejects.toThrow(
        "HTTP 500: Internal Server Error"
      );
    });

    it("should use correct endpoint path", async () => {
      const mockResponse = {
        ok: true,
        entry: {
          email: "user@example.com",
          createdAt: new Date().toISOString(),
          referralCode: "ABC-123",
        },
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      await client.join({ email: "user@example.com" });

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
        `${baseUrl}/api/waitlist/leaderboard`,
        expect.objectContaining({
          method: "GET",
        })
      );
      expect(result).toEqual(mockLeaderboard);
    });

    it("should throw FetchError when request fails", async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 404,
        statusText: "Not Found",
      });

      await expect(client.getLeaderboard()).rejects.toThrow(FetchError);
      await expect(client.getLeaderboard()).rejects.toThrow(
        "HTTP 404: Not Found"
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
        `${baseUrl}/api/waitlist/leaderboard`,
        expect.objectContaining({
          method: "GET",
        })
      );
    });
  });

  describe("integration scenarios", () => {
    it("should handle multiple join requests", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          ok: true,
          entry: {
            email: "user@example.com",
            createdAt: new Date().toISOString(),
            referralCode: "ABC",
          },
        }),
      });

      await client.join({ email: "user1@example.com" });
      await client.join({ email: "user2@example.com" });
      await client.join({ email: "user3@example.com" });

      expect(mockFetch).toHaveBeenCalledTimes(3);
    });

    it("should work with different base URLs", async () => {
      const client1 = new WaitlistClient({ baseUrl: "http://localhost:3000" });
      const client2 = new WaitlistClient({
        baseUrl: "https://api.production.com",
      });

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          ok: true,
          entry: {
            email: "user@example.com",
            createdAt: new Date().toISOString(),
            referralCode: "ABC",
          },
        }),
      });

      await client1.join({ email: "user@example.com" });
      await client2.join({ email: "user@example.com" });

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
          ok: true,
          entry: {
            email: "user@example.com",
            createdAt: new Date().toISOString(),
            referralCode: "ABC-123",
          },
        }),
      });

      await client.join({ email: "user@example.com" });

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
    it("should throw FetchError with status and response", async () => {
      const mockResponse = {
        ok: false,
        status: 400,
        statusText: "Bad Request",
      };

      mockFetch.mockResolvedValue(mockResponse);

      try {
        await client.join({ email: "user@example.com" });
        expect.fail("Should have thrown error");
      } catch (err) {
        expect(err).toBeInstanceOf(FetchError);
        expect((err as FetchError).message).toBe("HTTP 400: Bad Request");
        expect((err as FetchError).status).toBe(400);
        expect((err as FetchError).response).toBe(mockResponse);
      }
    });

    it("should handle JSON parse errors", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => {
          throw new Error("Invalid JSON");
        },
      });

      await expect(client.join({ email: "user@example.com" })).rejects.toThrow(
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

      await expect(client.join({ email: "user@example.com" })).rejects.toThrow(
        "Timeout"
      );
    });
  });

  describe("edge cases", () => {
    it("should handle special characters in email", async () => {
      const email = "user+tag@example.com";

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          ok: true,
          entry: {
            email,
            createdAt: new Date().toISOString(),
            referralCode: "ABC",
          },
        }),
      });

      await client.join({ email });

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
        json: async () => ({
          ok: true,
          entry: {
            email: "user@example.com",
            createdAt: new Date().toISOString(),
            referralCode: "ABC",
          },
        }),
      });

      await client.join({ email: "user@example.com", referralCode });

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

    it("should handle baseUrl with trailing slash by normalizing the URL", async () => {
      const clientWithSlash = new WaitlistClient({
        baseUrl: "http://localhost:3000/",
      });

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          ok: true,
          entry: {
            email: "user@example.com",
            createdAt: new Date().toISOString(),
            referralCode: "ABC",
          },
        }),
      });

      await clientWithSlash.join({ email: "user@example.com" });

      // @zap-studio/fetch normalizes URLs, removing double slashes
      expect(mockFetch).toHaveBeenCalledWith(
        "http://localhost:3000/api/waitlist/join",
        expect.any(Object)
      );
    });
  });
});
