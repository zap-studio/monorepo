import { describe, expect, it } from "vitest";

import type { FetchDefaults } from "../src/types.js";
import { resolveRequestUrl } from "../src/url.js";

const DEFAULTS: FetchDefaults = {
  baseURL: "",
  throwOnFetchError: true,
  throwOnValidationError: true,
};

describe(resolveRequestUrl, () => {
  it("joins baseURL and relative resources", () => {
    expect(
      resolveRequestUrl(
        "users",
        { ...DEFAULTS, baseURL: "https://api.example.com" }
      )
    ).toBe("https://api.example.com/users");
    expect(
      resolveRequestUrl(
        "/users",
        { ...DEFAULTS, baseURL: "https://api.example.com/" }
      )
    ).toBe("https://api.example.com/users");
  });

  it("ignores baseURL for absolute resources", () => {
    expect(
      resolveRequestUrl(
        "https://other.example.com/users",
        {
          ...DEFAULTS,
          baseURL: "https://api.example.com",
        }
      )
    ).toBe("https://other.example.com/users");
  });

  it("uses the base protocol for protocol-relative resources", () => {
    expect(
      resolveRequestUrl(
        "//other.example.com/users",
        {
          ...DEFAULTS,
          baseURL: "https://api.example.com",
        }
      )
    ).toBe("https://other.example.com/users");
  });

  it("keeps relative output when there is no baseURL", () => {
    expect(resolveRequestUrl("/users", DEFAULTS)).toBe("/users");
    expect(resolveRequestUrl("users", DEFAULTS)).toBe("users");
  });

  it("merges default, URL, and request search params in that order", () => {
    const url = resolveRequestUrl(
      "users?page=2&from=resource#team",
      {
        ...DEFAULTS,
        baseURL: "https://api.example.com",
        searchParams: { locale: "en", page: "1" },
      },
      { page: "3", q: "zap" }
    );

    expect(url).toBe(
      "https://api.example.com/users?page=3&locale=en&from=resource&q=zap#team"
    );
  });

  it("accepts native URLSearchParams constructor input", () => {
    expect(
      resolveRequestUrl(
        "users",
        { ...DEFAULTS, baseURL: "https://api.example.com" },
        [
          ["a", "1"],
          ["b", "2"],
        ]
      )
    ).toBe("https://api.example.com/users?a=1&b=2");
    expect(
      resolveRequestUrl(
        "users",
        { ...DEFAULTS, baseURL: "https://api.example.com" },
        new URLSearchParams({ q: "test" })
      )
    ).toBe("https://api.example.com/users?q=test");
    expect(
      resolveRequestUrl(
        "users",
        { ...DEFAULTS, baseURL: "https://api.example.com" },
        "q=test"
      )
    ).toBe("https://api.example.com/users?q=test");
  });

  it("does not add a query string for empty search params", () => {
    expect(
      resolveRequestUrl(
        "users#team",
        { ...DEFAULTS, baseURL: "https://api.example.com" },
        {}
      )
    ).toBe("https://api.example.com/users#team");
  });

  it("preserves an explicit empty fragment", () => {
    expect(
      resolveRequestUrl("https://api.example.com/users#", DEFAULTS)
    ).toBe("https://api.example.com/users#");
  });

  it("preserves an explicit empty fragment when adding search params", () => {
    expect(
      resolveRequestUrl("https://api.example.com/users#", DEFAULTS, {
        q: "zap",
      })
    ).toBe("https://api.example.com/users?q=zap#");
  });

  it("keeps a non-empty fragment when there is no query string to merge", () => {
    expect(resolveRequestUrl("/docs/guide#intro", DEFAULTS)).toBe(
      "/docs/guide#intro"
    );
    expect(
      resolveRequestUrl(
        "guide#intro",
        { ...DEFAULTS, baseURL: "https://api.example.com/docs/" }
      )
    ).toBe("https://api.example.com/docs/guide#intro");
  });

  it("merges search params before a fragment when the path already has a query", () => {
    expect(
      resolveRequestUrl(
        "items?sort=name#results",
        { ...DEFAULTS, baseURL: "https://api.example.com/" },
        {
          page: "2",
        }
      )
    ).toBe("https://api.example.com/items?sort=name&page=2#results");
  });
});
