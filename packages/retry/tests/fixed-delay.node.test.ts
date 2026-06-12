import { describe, expect, it } from "vitest";

import { FixedDelay } from "../src/fixed-delay.js";

describe(FixedDelay, () => {
  it("retries with constant delay before max attempts", () => {
    const policy = new FixedDelay({
      delayMs: 300,
      maxAttempts: 4,
    });

    expect(policy.next({ attempt: 1 })).toStrictEqual({
      delayMs: 300,
      reason: "retry",
      shouldRetry: true,
    });
    expect(policy.next({ attempt: 3 }).delayMs).toBe(300);
  });

  it("stops retrying when max attempts is reached", () => {
    const policy = new FixedDelay({
      delayMs: 300,
      maxAttempts: 2,
    });

    expect(policy.next({ attempt: 2 })).toStrictEqual({
      delayMs: 0,
      reason: "max-attempts-reached",
      shouldRetry: false,
    });
  });
});
