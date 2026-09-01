import { describe, expect, it } from "vitest";

import { EnvironmentAccessError, EnvironmentError, EnvironmentValidationError } from "./errors.ts";

describe("EnvironmentError", () => {
  it("sets the message and name", () => {
    const error = new EnvironmentError("bad config");

    expect(error.message).toBe("bad config");
    expect(error.name).toBe("EnvironmentError");
    expect(error).toBeInstanceOf(Error);
  });
});

describe("EnvironmentValidationError", () => {
  it("collects and sorts the invalid keys", () => {
    const error = new EnvironmentValidationError({
      PORT: [{ message: "Expected number" }],
      DATABASE_URL: [{ message: "Required" }],
    });

    expect(error.invalidKeys).toEqual(["DATABASE_URL", "PORT"]);
    expect(error.name).toBe("EnvironmentValidationError");
    expect(error).toBeInstanceOf(Error);
  });

  it("includes the invalid keys in the message without leaking values", () => {
    const error = new EnvironmentValidationError({ SECRET: [{ message: "Required" }] });

    expect(error.message).toContain("SECRET");
  });

  it("exposes the original issues per key", () => {
    const issues = { PORT: [{ message: "Expected number" }] };
    const error = new EnvironmentValidationError(issues);

    expect(error.issues).toBe(issues);
  });
});

describe("EnvironmentAccessError", () => {
  it("names the accessed key in the message", () => {
    const error = new EnvironmentAccessError("DATABASE_URL");

    expect(error.key).toBe("DATABASE_URL");
    expect(error.name).toBe("EnvironmentAccessError");
    expect(error.message).toContain("DATABASE_URL");
    expect(error).toBeInstanceOf(Error);
  });
});
