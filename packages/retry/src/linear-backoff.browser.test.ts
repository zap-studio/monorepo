import { describe, expect, it } from "vitest";

import { linearBackoff } from "./linear-backoff.ts";

describe(linearBackoff, () => {
  it("retries with base delay at first attempt", () => {
    const policy = linearBackoff({
      baseDelayMs: 100,
      incrementMs: 50,
      maxAttempts: 5,
      maxDelayMs: 1000,
    });

    expect(policy.next({ attempt: 1 })).toStrictEqual({
      delayMs: 100,
      reason: "retry",
      shouldRetry: true,
    });
  });

  it("grows delay linearly on subsequent attempts", () => {
    const policy = linearBackoff({
      baseDelayMs: 100,
      incrementMs: 50,
      maxAttempts: 5,
      maxDelayMs: 1000,
    });

    expect(policy.next({ attempt: 2 }).delayMs).toBe(150);
    expect(policy.next({ attempt: 3 }).delayMs).toBe(200);
  });

  it("caps delay at maxDelayMs", () => {
    const policy = linearBackoff({
      baseDelayMs: 100,
      incrementMs: 50,
      maxAttempts: 10,
      maxDelayMs: 220,
    });

    expect(policy.next({ attempt: 4 })).toStrictEqual({
      delayMs: 220,
      reason: "retry",
      shouldRetry: true,
    });
  });

  it("stops retrying when max attempts is reached", () => {
    const policy = linearBackoff({
      baseDelayMs: 100,
      incrementMs: 50,
      maxAttempts: 3,
      maxDelayMs: 1000,
    });

    expect(policy.next({ attempt: 3 })).toStrictEqual({
      delayMs: 0,
      reason: "max-attempts-reached",
      shouldRetry: false,
    });
  });

  it("applies jitter to the capped delay", () => {
    const policy = linearBackoff({
      baseDelayMs: 100,
      incrementMs: 50,
      jitter: { mode: "equal", random: () => 0 },
      maxAttempts: 5,
      maxDelayMs: 1000,
    });

    expect(policy.next({ attempt: 2 }).delayMs).toBe(75);
  });
});
