import { describe, expect, it } from "vitest";

import { AbortError } from "../src/errors.js";
import { FixedDelay } from "../src/fixed-delay.js";

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
