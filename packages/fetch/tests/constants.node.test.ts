import { describe, expect, it } from "vitest";

import { GLOBAL_DEFAULTS } from "../src/constants.js";

describe(GLOBAL_DEFAULTS, () => {
  it("uses fetch-compatible defaults", () => {
    expect(GLOBAL_DEFAULTS).toStrictEqual({
      baseURL: "",
      throwOnFetchError: true,
      throwOnValidationError: true,
    });
  });
});
