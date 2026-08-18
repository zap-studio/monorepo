import { describe, expect, it } from "vitest";

import type { ExtendedRequestInit, FetchDefaults } from "./types.ts";

describe("types", () => {
  it("models native request body input and json input as separate options", () => {
    const requestBody: ExtendedRequestInit = { body: "raw" };
    const jsonBody: ExtendedRequestInit = { json: { name: "Zap" } };
    const defaults: FetchDefaults = {
      baseURL: "",
      throwOnFetchError: true,
      throwOnValidationError: true,
    };

    // @ts-expect-error body and json are mutually exclusive.
    const invalid: ExtendedRequestInit = { body: "raw", json: { name: "Zap" } };

    expect(requestBody.body).toBe("raw");
    expect("json" in jsonBody).toBeTruthy();
    expect(defaults.throwOnFetchError).toBeTruthy();
    void invalid;
  });
});
