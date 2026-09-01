import { describe, expect, it } from "vitest";
import { z } from "zod";

import {
  createEnvironment,
  EnvironmentAccessError,
  EnvironmentError,
  EnvironmentValidationError,
  generateEnvironmentExample,
} from "./index.ts";

describe("index re-exports", () => {
  it("re-exports createEnvironment", () => {
    const env = createEnvironment({
      server: { PORT: z.coerce.number() },
      runtimeEnvironment: { PORT: "3000" },
      isServer: true,
    });

    expect(env.PORT).toBe(3000);
  });

  it("re-exports generateEnvironmentExample", () => {
    expect(generateEnvironmentExample({ server: { PORT: z.coerce.number() } })).toBe(
      "# server, required\nPORT=\n",
    );
  });

  it("re-exports EnvironmentError, EnvironmentValidationError, and EnvironmentAccessError", () => {
    expect(new EnvironmentError("x")).toBeInstanceOf(Error);
    expect(new EnvironmentValidationError({})).toBeInstanceOf(Error);
    expect(new EnvironmentAccessError("X")).toBeInstanceOf(Error);
  });
});
