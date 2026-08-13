import { describe, expect, it } from "vitest";

import { RetryError } from "./errors.js";
import type {
  RetryDecisionInput,
  RetryExhaustedInput,
  RetryPolicy,
  RetryRunOptions,
  RetryRunResult,
} from "./types.js";

describe("types", () => {
  it("supports generic RetryPolicy contracts", () => {
    const policy: RetryPolicy<TypeError, { status: number }> = {
      next: (input: RetryDecisionInput<TypeError, { status: number }>) => ({
        delayMs: 100,
        reason: "retry",
        shouldRetry: input.attempt < 3,
      }),
      onExhausted: (
        input: RetryExhaustedInput<TypeError, { status: number }>
      ) =>
        new RetryError("exhausted", {
          attempts: input.attempts,
          lastData: input.data,
          lastError: input.error,
        }),
    };

    const decision = policy.next({
      attempt: 1,
      data: { status: 500 },
      error: new TypeError("network"),
    });
    const error = policy.onExhausted({
      attempts: 3,
      data: { status: 500 },
      error: new TypeError("network"),
    });

    expect(decision.shouldRetry).toBeTruthy();
    expect(decision.delayMs).toBe(100);
    expect(error).toBeInstanceOf(RetryError);
  });

  it("accepts empty run options", () => {
    const options: RetryRunOptions = { throwOnExhausted: false };
    const result: RetryRunResult<string> = {
      ok: true,
      value: "ok",
    };

    expect(options).toStrictEqual({ throwOnExhausted: false });
    expect(result).toStrictEqual({ ok: true, value: "ok" });
  });
});
