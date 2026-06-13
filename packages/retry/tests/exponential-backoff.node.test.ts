import { describe, expect, it } from "vitest";

import { ExponentialBackoff } from "../src/exponential-backoff.js";

describe(ExponentialBackoff, () => {
  it("retries with base delay at first attempt", () => {
    const policy = new ExponentialBackoff({
      baseDelayMs: 100,
      maxAttempts: 5,
      maxDelayMs: 1000,
    });

    expect(policy.next({ attempt: 1 })).toStrictEqual({
      delayMs: 100,
      reason: "retry",
      shouldRetry: true,
    });
  });

  it("doubles delay on subsequent attempts", () => {
    const policy = new ExponentialBackoff({
      baseDelayMs: 100,
      maxAttempts: 5,
      maxDelayMs: 1000,
    });

    expect(policy.next({ attempt: 2 }).delayMs).toBe(200);
    expect(policy.next({ attempt: 3 }).delayMs).toBe(400);
  });

  it("caps delay at maxDelayMs", () => {
    const policy = new ExponentialBackoff({
      baseDelayMs: 100,
      maxAttempts: 10,
      maxDelayMs: 250,
    });

    expect(policy.next({ attempt: 4 })).toStrictEqual({
      delayMs: 250,
      reason: "retry",
      shouldRetry: true,
    });
  });

  it("stops retrying when max attempts is reached", () => {
    const policy = new ExponentialBackoff({
      baseDelayMs: 100,
      maxAttempts: 3,
      maxDelayMs: 1000,
    });

    expect(policy.next({ attempt: 3 })).toStrictEqual({
      delayMs: 0,
      reason: "max-attempts-reached",
      shouldRetry: false,
    });
  });
});
