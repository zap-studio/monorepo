import { describe, expect, it } from "vitest";

import { expectFailureResult, SequencePolicy } from "./sequence-policy.js";

describe("test helpers", () => {
  describe(SequencePolicy, () => {
    it("falls back to a terminal decision when constructed without decisions", () => {
      const policy = new SequencePolicy([]);

      const decision = policy.next({
        attempt: 1,
        error: new Error("boom"),
      });

      expect(decision).toStrictEqual({
        delayMs: 0,
        reason: "policy-declined",
        shouldRetry: false,
      });
    });

    it("repeats the last decision once the sequence is exhausted", () => {
      const policy = new SequencePolicy([
        { delayMs: 5, reason: "retryable", shouldRetry: true },
      ]);
      const input = {
        attempt: 1,
        error: new Error("boom"),
      };

      const first = policy.next(input);
      const second = policy.next({ ...input, attempt: 2 });

      expect(first).toStrictEqual(second);
      expect(policy.seen).toHaveLength(2);
    });
  });

  describe(expectFailureResult, () => {
    it("returns the failure result unchanged", () => {
      const policy = new SequencePolicy([]);
      const failure = {
        attempts: 1,
        error: policy.onExhausted({
          attempts: 1,
          error: new Error("boom"),
        }),
        ok: false,
      } as const;

      expect(expectFailureResult(failure)).toBe(failure);
    });

    it("fails the test when given a success result", () => {
      expect(() =>
        expectFailureResult({ ok: true, value: "done" })
      ).toThrowError("Expected failure result");
    });
  });
});
