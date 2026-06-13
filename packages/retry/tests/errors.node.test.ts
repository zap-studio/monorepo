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
    expect(error).toMatchObject({
      attempts: 3,
      lastData: { id: 1 },
      lastError,
      message: "Retry exhausted",
      name: "RetryError",
    });
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
    expect(error).toMatchObject({
      cause,
      message: "Retry aborted",
      name: "AbortError",
    });
  });

  it("supports missing optional context values", () => {
    const error = new AbortError("Retry aborted");

    expect(error.cause).toBeUndefined();
  });
});
