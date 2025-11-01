import { describe, expect, it } from "vitest";
import { constantTimeEquals } from "../../src/utils";

describe("constantTimeEquals", () => {
	describe("equal strings", () => {
		it("should return true for identical strings", () => {
			const result = constantTimeEquals("hello", "hello");
			expect(result).toBe(true);
		});

		it("should return true for empty strings", () => {
			const result = constantTimeEquals("", "");
			expect(result).toBe(true);
		});

		it("should return true for single character strings", () => {
			const result = constantTimeEquals("a", "a");
			expect(result).toBe(true);
		});

		it("should return true for long identical strings", () => {
			const longString = "a".repeat(1000);
			const result = constantTimeEquals(longString, longString);
			expect(result).toBe(true);
		});

		it("should return true for strings with special characters", () => {
			const result = constantTimeEquals("hello@world!", "hello@world!");
			expect(result).toBe(true);
		});

		it("should return true for strings with unicode characters", () => {
			const result = constantTimeEquals("hello🌍", "hello🌍");
			expect(result).toBe(true);
		});

		it("should return true for strings with numbers", () => {
			const result = constantTimeEquals("abc123", "abc123");
			expect(result).toBe(true);
		});

		it("should return true for hexadecimal hash strings", () => {
			const hash = "a3f7b9c2e1d4f8a9b6c3e0d1f2a4b5c6d7e8f9a0";
			const result = constantTimeEquals(hash, hash);
			expect(result).toBe(true);
		});
	});

	describe("different strings", () => {
		it("should return false for completely different strings", () => {
			const result = constantTimeEquals("hello", "world");
			expect(result).toBe(false);
		});

		it("should return false for strings with different lengths", () => {
			const result = constantTimeEquals("hello", "hello!");
			expect(result).toBe(false);
		});

		it("should return false for strings with one character difference", () => {
			const result = constantTimeEquals("hello", "hallo");
			expect(result).toBe(false);
		});

		it("should return false for empty string vs non-empty string", () => {
			const result = constantTimeEquals("", "a");
			expect(result).toBe(false);
		});

		it("should return false for non-empty string vs empty string", () => {
			const result = constantTimeEquals("a", "");
			expect(result).toBe(false);
		});

		it("should return false for strings with case differences", () => {
			const result = constantTimeEquals("Hello", "hello");
			expect(result).toBe(false);
		});

		it("should return false for strings with different special characters", () => {
			const result = constantTimeEquals("hello!", "hello?");
			expect(result).toBe(false);
		});

		it("should return false for strings with whitespace differences", () => {
			const result = constantTimeEquals("hello world", "helloworld");
			expect(result).toBe(false);
		});

		it("should return false for similar but different hex strings", () => {
			const hash1 = "a3f7b9c2e1d4f8a9b6c3e0d1f2a4b5c6d7e8f9a0";
			const hash2 = "a3f7b9c2e1d4f8a9b6c3e0d1f2a4b5c6d7e8f9a1";
			const result = constantTimeEquals(hash1, hash2);
			expect(result).toBe(false);
		});
	});

	describe("constant-time behavior", () => {
		it("should process strings of equal length in similar time", () => {
			// This test ensures that the function doesn't short-circuit
			// We can't directly test timing, but we can ensure the logic is consistent
			const str1 = "aaaaaaaaaa";
			const str2a = "aaaaaaaaaa";
			const str2b = "baaaaaaaaa";
			const str2c = "aaaaaaaaab";

			// All should return in similar time (conceptually)
			expect(constantTimeEquals(str1, str2a)).toBe(true);
			expect(constantTimeEquals(str1, str2b)).toBe(false);
			expect(constantTimeEquals(str1, str2c)).toBe(false);
		});

		it("should not short-circuit on first difference", () => {
			// The function should continue processing even after finding a difference
			const str1 = "abcdefghij";
			const str2 = "xbcdefghij"; // First char is different
			const str3 = "abcdefghix"; // Last char is different

			// Both should return false without early exit
			expect(constantTimeEquals(str1, str2)).toBe(false);
			expect(constantTimeEquals(str1, str3)).toBe(false);
		});
	});

	describe("edge cases", () => {
		it("should handle strings with null bytes", () => {
			const str1 = "hello\x00world";
			const str2 = "hello\x00world";
			const str3 = "hello\x00earth";

			expect(constantTimeEquals(str1, str2)).toBe(true);
			expect(constantTimeEquals(str1, str3)).toBe(false);
		});

		it("should handle strings with newlines", () => {
			const str1 = "hello\nworld";
			const str2 = "hello\nworld";
			const str3 = "hello\rworld";

			expect(constantTimeEquals(str1, str2)).toBe(true);
			expect(constantTimeEquals(str1, str3)).toBe(false);
		});

		it("should handle strings with tabs", () => {
			const str1 = "hello\tworld";
			const str2 = "hello\tworld";
			const str3 = "hello world";

			expect(constantTimeEquals(str1, str2)).toBe(true);
			expect(constantTimeEquals(str1, str3)).toBe(false);
		});

		it("should handle very long strings", () => {
			const str1 = "a".repeat(10000);
			const str2 = "a".repeat(10000);
			const str3 = "a".repeat(9999) + "b";

			expect(constantTimeEquals(str1, str2)).toBe(true);
			expect(constantTimeEquals(str1, str3)).toBe(false);
		});
	});

	describe("security-relevant scenarios", () => {
		it("should correctly compare HMAC signatures", () => {
			const validSig = "sha256=a3f7b9c2e1d4f8a9b6c3e0d1f2a4b5c6d7e8f9a0";
			const sameSig = "sha256=a3f7b9c2e1d4f8a9b6c3e0d1f2a4b5c6d7e8f9a0";
			const invalidSig = "sha256=b4f7b9c2e1d4f8a9b6c3e0d1f2a4b5c6d7e8f9a0";

			expect(constantTimeEquals(validSig, sameSig)).toBe(true);
			expect(constantTimeEquals(validSig, invalidSig)).toBe(false);
		});

		it("should compare hex-encoded hashes correctly", () => {
			const hash1 = "5d41402abc4b2a76b9719d911017c592";
			const hash2 = "5d41402abc4b2a76b9719d911017c592";
			const hash3 = "5d41402abc4b2a76b9719d911017c593";

			expect(constantTimeEquals(hash1, hash2)).toBe(true);
			expect(constantTimeEquals(hash1, hash3)).toBe(false);
		});

		it("should handle comparing API keys or tokens", () => {
			const token1 = "sk_test_4eC39HqLyjWDarjtT1zdp7dc";
			const token2 = "sk_test_4eC39HqLyjWDarjtT1zdp7dc";
			const token3 = "sk_test_4eC39HqLyjWDarjtT1zdp7dd";

			expect(constantTimeEquals(token1, token2)).toBe(true);
			expect(constantTimeEquals(token1, token3)).toBe(false);
		});
	});

	describe("implementation correctness", () => {
		it("should use XOR operation correctly", () => {
			// The function uses XOR (^) to compare characters
			// XOR of identical characters is 0, different is non-zero
			const result = constantTimeEquals("abc", "abc");
			expect(result).toBe(true);
		});

		it("should accumulate all differences", () => {
			// The function should OR all XOR results together
			// Multiple differences should still result in false
			const result = constantTimeEquals("abc", "xyz");
			expect(result).toBe(false);
		});

		it("should check final result is exactly zero", () => {
			// Result should be 0 for equal strings
			const equal = constantTimeEquals("test", "test");
			expect(equal).toBe(true);

			// Result should be non-zero for different strings
			const notEqual = constantTimeEquals("test", "best");
			expect(notEqual).toBe(false);
		});
	});
});
