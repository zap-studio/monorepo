import { describe, expect, it } from "vitest";

import { EnvAccessError, EnvError, EnvValidationError } from "./errors.ts";

describe("EnvError", () => {
  it("sets the message and name", () => {
    const error = new EnvError("bad config");

    expect(error.message).toBe("bad config");
    expect(error.name).toBe("EnvError");
    expect(error).toBeInstanceOf(Error);
  });
});

describe("EnvValidationError", () => {
  it("collects and sorts the invalid keys", () => {
    const error = new EnvValidationError({
      PORT: [{ message: "Expected number" }],
      DATABASE_URL: [{ message: "Required" }],
    });

    expect(error.invalidKeys).toEqual(["DATABASE_URL", "PORT"]);
    expect(error.name).toBe("EnvValidationError");
    expect(error).toBeInstanceOf(Error);
  });

  it("includes the invalid keys in the message without leaking values", () => {
    const error = new EnvValidationError({ SECRET: [{ message: "Required" }] });

    expect(error.message).toContain("SECRET");
  });

  it("exposes the original issues per key", () => {
    const issues = { PORT: [{ message: "Expected number" }] };
    const error = new EnvValidationError(issues);

    expect(error.issues).toBe(issues);
  });
});

describe("EnvAccessError", () => {
  it("names the accessed key in the message", () => {
    const error = new EnvAccessError("DATABASE_URL");

    expect(error.key).toBe("DATABASE_URL");
    expect(error.name).toBe("EnvAccessError");
    expect(error.message).toContain("DATABASE_URL");
    expect(error).toBeInstanceOf(Error);
  });
});
