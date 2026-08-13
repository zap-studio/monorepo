import { describe, expect, it } from "vitest";

import { AbortError } from "./errors.js";
import { FixedDelay } from "./fixed-delay.js";

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

describe("@zap-studio/retry browser runtime", () => {
  it("throws AbortError when a browser AbortSignal is already aborted", async () => {
    const controller = new AbortController();
    controller.abort("stop");
    const policy = new FixedDelay({ delayMs: 0, maxAttempts: 2 });

    await expect(
      policy.run(
        () => {
          throw new Error("should not run");
        },
        {
          signal: controller.signal,
        }
      )
    ).rejects.toBeInstanceOf(AbortError);
  });

  it("returns abort results for browser AbortSignal in non-throw mode", async () => {
    const controller = new AbortController();
    const policy = new FixedDelay({ delayMs: 1, maxAttempts: 3 });

    const result = await policy.run(
      async () => {
        await Promise.resolve();
        controller.abort(new Error("cancelled"));
        throw new Error("fail");
      },
      {
        signal: controller.signal,
        throwOnExhausted: false,
      }
    );

    expect(result).toMatchObject({
      attempts: 1,
      error: expect.any(AbortError),
      ok: false,
    });
  });
});
