import { describe, expect, it } from "vitest";
import { PolicyError } from "../src/errors";

describe("PolicyError", () => {
  describe("constructor", () => {
    it("should create an error with the provided message", () => {
      const error = new PolicyError("Policy evaluation failed");

      expect(error.message).toBe("Policy evaluation failed");
    });

    it("should set the name property to 'PolicyError'", () => {
      const error = new PolicyError("Test error");

      expect(error.name).toBe("PolicyError");
    });

    it("should handle empty message", () => {
      const error = new PolicyError("");

      expect(error.message).toBe("");
      expect(error.name).toBe("PolicyError");
    });

    it("should handle message with special characters", () => {
      const message = "Error: Invalid policy config\n\tDetails: missing rules";
      const error = new PolicyError(message);

      expect(error.message).toBe(message);
    });
  });

  describe("inheritance", () => {
    it("should be an instance of Error", () => {
      const error = new PolicyError("Test");

      expect(error).toBeInstanceOf(Error);
    });

    it("should be an instance of PolicyError", () => {
      const error = new PolicyError("Test");

      expect(error).toBeInstanceOf(PolicyError);
    });

    it("should be catchable as an Error", () => {
      expect(() => {
        throw new PolicyError("Test Error");
      }).toThrow(Error);
    });

    it("should be catchable as a PolicyError", () => {
      expect(() => {
        throw new PolicyError("Test Error");
      }).toThrow(PolicyError);
    });
  });

  describe("properties", () => {
    it("should have correct message format", () => {
      const customMessage = "Invalid resource type: unknown";
      const error = new PolicyError(customMessage);

      expect(error.message).toBe(customMessage);
    });

    it("should have a stack trace", () => {
      const error = new PolicyError("Test");

      expect(error.stack).toBeDefined();
      expect(typeof error.stack).toBe("string");
    });

    it("should preserve Error prototype chain", () => {
      const error = new PolicyError("Test");

      expect(Object.getPrototypeOf(error)).toBe(PolicyError.prototype);
      expect(Object.getPrototypeOf(PolicyError.prototype)).toBe(
        Error.prototype
      );
    });
  });

  describe("use cases", () => {
    it("should work in try-catch blocks", () => {
      let caught: PolicyError | null = null;

      try {
        throw new PolicyError("Access denied");
      } catch (e) {
        if (e instanceof PolicyError) {
          caught = e;
        }
      }

      expect(caught).toBeInstanceOf(PolicyError);
      expect(caught?.message).toBe("Access denied");
    });

    it("should work with Promise.reject", async () => {
      const promise = Promise.reject(new PolicyError("Async error"));

      await expect(promise).rejects.toThrow(PolicyError);
      await expect(promise).rejects.toThrow("Async error");
    });

    it("should be distinguishable from regular Error", () => {
      const policyError = new PolicyError("Policy error");
      const regularError = new Error("Regular error");

      expect(policyError instanceof PolicyError).toBe(true);
      expect(regularError instanceof PolicyError).toBe(false);
    });
  });
});
