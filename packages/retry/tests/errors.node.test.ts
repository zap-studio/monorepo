import { describe, expect, it } from "vitest";

import { AbortError, RetryError } from "../src/errors.js";

describe(RetryError, () => {
  it("stores message and context fields", () => {
    const lastError = new Error("boom");
    const error = new RetryError("Retry exhausted", {
      attempts: 3,
      lastData: { id: 1 },
      lastError,
    });

    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe("RetryError");
    expect(error.message).toBe("Retry exhausted");
    expect(error.attempts).toBe(3);
    expect(error.lastError).toBe(lastError);
    expect(error.lastData).toStrictEqual({ id: 1 });
  });

  it("supports missing optional context values", () => {
    const error = new RetryError("Retry exhausted", { attempts: 1 });

    expect(error.lastError).toBeUndefined();
    expect(error.lastData).toBeUndefined();
  });
});

describe(AbortError, () => {
  it("stores message and optional cause", () => {
    const cause = new Error("root-cause");
    const error = new AbortError("Retry aborted", { cause });

    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe("AbortError");
    expect(error.message).toBe("Retry aborted");
    expect(error.cause).toBe(cause);
  });

  it("supports missing optional context values", () => {
    const error = new AbortError("Retry aborted");

    expect(error.cause).toBeUndefined();
  });
});
