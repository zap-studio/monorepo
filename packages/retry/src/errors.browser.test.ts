import { describe, expect, it } from "vitest";

import { AbortError, RetryError } from "./errors.ts";

const RETRY_EXHAUSTED_MESSAGE = "Retry exhausted";
const RETRY_ABORTED_MESSAGE = "Retry aborted";

describe("RetryError", () => {
  it("stores message and context fields", () => {
    const lastError = new Error("boom");
    const error = new RetryError(RETRY_EXHAUSTED_MESSAGE, {
      attempts: 3,
      lastData: { id: 1 },
      lastError,
    });

    expect(error).toBeInstanceOf(Error);
    expect(error).toMatchObject({
      attempts: 3,
      lastData: { id: 1 },
      lastError,
      message: RETRY_EXHAUSTED_MESSAGE,
      name: "RetryError",
    });
  });

  it("supports missing optional context values", () => {
    const error = new RetryError(RETRY_EXHAUSTED_MESSAGE, { attempts: 1 });

    expect(error.lastError).toBeUndefined();
    expect(error.lastData).toBeUndefined();
  });
});

describe("AbortError", () => {
  it("stores message and optional cause", () => {
    const cause = new Error("root-cause");
    const error = new AbortError(RETRY_ABORTED_MESSAGE, { cause });

    expect(error).toBeInstanceOf(Error);
    expect(error).toMatchObject({
      cause,
      message: RETRY_ABORTED_MESSAGE,
      name: "AbortError",
    });
  });

  it("supports missing optional context values", () => {
    const error = new AbortError(RETRY_ABORTED_MESSAGE);

    expect(error.cause).toBeUndefined();
  });
});
