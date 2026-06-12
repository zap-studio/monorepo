import { describe, expect, it } from "vitest";

import { RetryError } from "../src/errors.js";
import { SequencePolicy } from "./sequence-policy.js";

describe("BaseRetryPolicy", () => {
  it("creates RetryError with data from default onExhausted", () => {
    const policy = new SequencePolicy([
      { delayMs: 0, reason: "policy-declined", shouldRetry: false },
    ]);

    const error = policy.onExhausted({
      attempts: 3,
      data: "payload",
      error: new Error("boom"),
    });

    expect(error).toBeInstanceOf(RetryError);
    expect(error.lastData).toBe("payload");
    expect(error.attempts).toBe(3);
  });
});
