import { describe, expect, it } from "vitest";
import { z } from "zod";

import {
  createEnv,
  EnvAccessError,
  EnvError,
  EnvValidationError,
  generateEnvExample,
} from "./index.ts";

describe("index re-exports", () => {
  it("re-exports createEnv", () => {
    const env = createEnv({
      server: { PORT: z.coerce.number() },
      runtimeEnv: { PORT: "3000" },
      isServer: true,
    });

    expect(env.PORT).toBe(3000);
  });

  it("re-exports generateEnvExample", () => {
    expect(generateEnvExample({ server: { PORT: z.coerce.number() } })).toBe(
      "# server, required\nPORT=\n",
    );
  });

  it("re-exports EnvError, EnvValidationError, and EnvAccessError", () => {
    expect(new EnvError("x")).toBeInstanceOf(Error);
    expect(new EnvValidationError({})).toBeInstanceOf(Error);
    expect(new EnvAccessError("X")).toBeInstanceOf(Error);
  });
});
