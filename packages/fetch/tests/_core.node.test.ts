import type { StandardSchemaV1 } from "@zap-studio/validation";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  fetchInternal,
  GLOBAL_DEFAULTS,
  mergeHeaders,
  normalizeRequest,
  resolveRequestUrl,
} from "../src/_core.js";
import { FetchError } from "../src/errors.js";
import type { ExtendedRequestInit, FetchDefaults } from "../src/types.js";

describe("global fetch defaults", () => {
  it("uses fetch-compatible defaults", () => {
    expect(GLOBAL_DEFAULTS).toStrictEqual({
      baseURL: "",
      throwOnFetchError: true,
      throwOnValidationError: true,
    });
  });
});

describe(mergeHeaders, () => {
  it("returns undefined when no headers are provided", () => {
    expect(mergeHeaders()).toBeUndefined();
  });

  it("accepts object, Headers, and tuple inputs", () => {
    const base = new Headers({ A: "1" });
    const tuples: [string, string][] = [["B", "2"]];

    const fromObject = mergeHeaders({ A: "1" });
    const fromHeaders = mergeHeaders(base);
    const fromTuples = mergeHeaders(tuples);

    expect(fromObject?.get("A")).toBe("1");
    expect(fromHeaders?.get("A")).toBe("1");
    expect(fromTuples?.get("B")).toBe("2");
  });

  it("merges headers with override values taking precedence", () => {
    const headers = mergeHeaders({ A: "1", B: "2" }, { B: "20", C: "3" });

    expect(headers?.get("A")).toBe("1");
    expect(headers?.get("B")).toBe("20");
    expect(headers?.get("C")).toBe("3");
  });
});

describe(normalizeRequest, () => {
  it("keeps URL strings simple", () => {
    const options = { headers: { A: "1" }, method: "POST" };

    expect(
      normalizeRequest("https://api.example.com/users", options)
    ).toStrictEqual({
      options,
      url: "https://api.example.com/users",
    });
  });

  it("uses an empty options object when none is provided", () => {
    expect(normalizeRequest("/users")).toStrictEqual({
      options: {},
      url: "/users",
    });
  });

  it("serializes URL objects to a string url", () => {
    const input = new URL("/users", "https://api.example.com");
    expect(normalizeRequest(input)).toStrictEqual({
      options: {},
      url: "https://api.example.com/users",
    });
  });

  it("clones Request inputs and exposes their URL", () => {
    const request = new Request("https://api.example.com/users", {
      headers: { A: "1" },
      method: "POST",
    });

    const normalized = normalizeRequest(request);

    expect(normalized.url).toBe("https://api.example.com/users");
    expect(normalized.request).toBeInstanceOf(Request);
    expect(normalized.request).not.toBe(request);
    expect(new Headers(normalized.options.headers).get("A")).toBe("1");
  });

  it("lets options override Request headers while preserving the other Request headers", () => {
    const request = new Request("https://api.example.com/users", {
      headers: { A: "1", B: "2" },
    });

    const normalized = normalizeRequest(request, {
      headers: { B: "20", C: "3" },
      method: "PATCH",
    });
    const headers = new Headers(normalized.options.headers);

    expect(normalized.options.method).toBe("PATCH");
    expect(headers.get("A")).toBe("1");
    expect(headers.get("B")).toBe("20");
    expect(headers.get("C")).toBe("3");
  });
});

const URL_DEFAULTS: FetchDefaults = {
  baseURL: "",
  throwOnFetchError: true,
  throwOnValidationError: true,
};

describe(resolveRequestUrl, () => {
  it("joins baseURL and relative resources", () => {
    expect(
      resolveRequestUrl("users", {
        ...URL_DEFAULTS,
        baseURL: "https://api.example.com",
      })
    ).toBe("https://api.example.com/users");
    expect(
      resolveRequestUrl("/users", {
        ...URL_DEFAULTS,
        baseURL: "https://api.example.com/",
      })
    ).toBe("https://api.example.com/users");
  });

  it("ignores baseURL for absolute resources", () => {
    expect(
      resolveRequestUrl("https://other.example.com/users", {
        ...URL_DEFAULTS,
        baseURL: "https://api.example.com",
      })
    ).toBe("https://other.example.com/users");
  });

  it("uses the base protocol for protocol-relative resources", () => {
    expect(
      resolveRequestUrl("//other.example.com/users", {
        ...URL_DEFAULTS,
        baseURL: "https://api.example.com",
      })
    ).toBe("https://other.example.com/users");
  });

  it("keeps relative output when there is no baseURL", () => {
    expect(resolveRequestUrl("/users", URL_DEFAULTS)).toBe("/users");
    expect(resolveRequestUrl("users", URL_DEFAULTS)).toBe("users");
  });

  it("merges default, URL, and request search params in that order", () => {
    const url = resolveRequestUrl(
      "users?page=2&from=resource#team",
      {
        ...URL_DEFAULTS,
        baseURL: "https://api.example.com",
        searchParams: { locale: "en", page: "1" },
      },
      { page: "3", q: "zap" }
    );

    expect(url).toBe(
      "https://api.example.com/users?locale=en&page=3&from=resource&q=zap#team"
    );
  });

  it("accepts native URLSearchParams constructor input", () => {
    expect(
      resolveRequestUrl(
        "users",
        { ...URL_DEFAULTS, baseURL: "https://api.example.com" },
        [
          ["a", "1"],
          ["b", "2"],
        ]
      )
    ).toBe("https://api.example.com/users?a=1&b=2");
    expect(
      resolveRequestUrl(
        "users",
        { ...URL_DEFAULTS, baseURL: "https://api.example.com" },
        new URLSearchParams({ q: "test" })
      )
    ).toBe("https://api.example.com/users?q=test");
    expect(
      resolveRequestUrl(
        "users",
        { ...URL_DEFAULTS, baseURL: "https://api.example.com" },
        "q=test"
      )
    ).toBe("https://api.example.com/users?q=test");
  });

  it("does not add a query string for empty search params", () => {
    expect(
      resolveRequestUrl(
        "users#team",
        { ...URL_DEFAULTS, baseURL: "https://api.example.com" },
        {}
      )
    ).toBe("https://api.example.com/users#team");
  });

  it("preserves an explicit empty fragment", () => {
    expect(
      resolveRequestUrl("https://api.example.com/users#", URL_DEFAULTS)
    ).toBe("https://api.example.com/users#");
  });

  it("preserves an explicit empty fragment when adding search params", () => {
    expect(
      resolveRequestUrl("https://api.example.com/users#", URL_DEFAULTS, {
        q: "zap",
      })
    ).toBe("https://api.example.com/users?q=zap#");
  });

  it("keeps a non-empty fragment when there is no query string to merge", () => {
    expect(resolveRequestUrl("/docs/guide#intro", URL_DEFAULTS)).toBe(
      "/docs/guide#intro"
    );
    expect(
      resolveRequestUrl("guide#intro", {
        ...URL_DEFAULTS,
        baseURL: "https://api.example.com/docs/",
      })
    ).toBe("https://api.example.com/docs/guide#intro");
  });

  it("merges search params before a fragment when the path already has a query", () => {
    expect(
      resolveRequestUrl(
        "items?sort=name#results",
        { ...URL_DEFAULTS, baseURL: "https://api.example.com/" },
        {
          page: "2",
        }
      )
    ).toBe("https://api.example.com/items?sort=name&page=2#results");
  });
});

const INTERNAL_DEFAULTS: FetchDefaults = {
  baseURL: "https://api.example.com",
  throwOnFetchError: true,
  throwOnValidationError: true,
};

const passSchema = {
  "~standard": {
    validate: (input: unknown) => ({ value: input }),
    vendor: "test",
    version: 1,
  },
} satisfies StandardSchemaV1;

const failSchema = {
  "~standard": {
    validate: () => ({ issues: [{ message: "Invalid value" }] }),
    vendor: "test",
    version: 1,
  },
} satisfies StandardSchemaV1;

describe(fetchInternal, () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn<typeof fetch>();
    globalThis.fetch = fetchMock as typeof fetch;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns the raw Response when no schema is provided", async () => {
    const response = new Response(JSON.stringify({ ok: true }));
    fetchMock.mockResolvedValue(response);

    await expect(
      fetchInternal("users", undefined, undefined, INTERNAL_DEFAULTS)
    ).resolves.toBe(response);
    expect(fetchMock).toHaveBeenCalledWith("https://api.example.com/users", {});
  });

  it("throws FetchError for non-ok responses by default", async () => {
    const response = new Response("Nope", {
      status: 500,
      statusText: "Server Error",
    });
    fetchMock.mockResolvedValue(response);

    await expect(
      fetchInternal("users", undefined, undefined, INTERNAL_DEFAULTS)
    ).rejects.toThrow(FetchError);
  });

  it("can return non-ok responses when fetch errors are disabled", async () => {
    const response = new Response("Nope", {
      status: 404,
      statusText: "Not Found",
    });
    fetchMock.mockResolvedValue(response);

    await expect(
      fetchInternal(
        "users",
        undefined,
        { throwOnFetchError: false },
        INTERNAL_DEFAULTS
      )
    ).resolves.toBe(response);
  });

  it("validates JSON responses when a schema is provided", async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ id: 1 })));

    await expect(
      fetchInternal("users/1", passSchema, undefined, INTERNAL_DEFAULTS)
    ).resolves.toStrictEqual({
      id: 1,
    });
  });

  it("returns validation results when validation errors are disabled", async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ id: "bad" })));

    await expect(
      fetchInternal(
        "users/1",
        failSchema,
        { throwOnValidationError: false },
        INTERNAL_DEFAULTS
      )
    ).resolves.toStrictEqual({ issues: [{ message: "Invalid value" }] });
  });

  it("uses default validation error behavior when options do not override it", async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ id: "bad" })));

    await expect(
      fetchInternal("users/1", failSchema, undefined, {
        ...INTERNAL_DEFAULTS,
        throwOnValidationError: false,
      })
    ).resolves.toStrictEqual({ issues: [{ message: "Invalid value" }] });
  });

  it("merges default and request headers", async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ ok: true })));

    await fetchInternal(
      "users",
      undefined,
      { headers: { B: "2" } },
      { ...INTERNAL_DEFAULTS, headers: { A: "1" } }
    );
    const init = fetchMock.mock.calls[0]?.[1] as RequestInit;
    const headers = new Headers(init.headers);

    expect(headers.get("A")).toBe("1");
    expect(headers.get("B")).toBe("2");
  });

  it("stringifies json and adds a JSON content type", async () => {
    const json = { name: "Zap" };
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ ok: true })));

    await fetchInternal(
      "users",
      undefined,
      { json, method: "POST" },
      INTERNAL_DEFAULTS
    );
    const init = fetchMock.mock.calls[0]?.[1] as RequestInit;

    expect(init.body).toBe(JSON.stringify(json));
    expect(new Headers(init.headers).get("Content-Type")).toBe(
      "application/json"
    );
  });

  it("does not override an explicit JSON content type", async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ ok: true })));

    await fetchInternal(
      "users",
      undefined,
      {
        headers: { "Content-Type": "application/vnd.api+json" },
        json: { name: "Zap" },
        method: "POST",
      },
      INTERNAL_DEFAULTS
    );
    const init = fetchMock.mock.calls[0]?.[1] as RequestInit;

    expect(new Headers(init.headers).get("Content-Type")).toBe(
      "application/vnd.api+json"
    );
  });

  it("adds JSON content type when default headers exist without one", async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ ok: true })));

    await fetchInternal(
      "users",
      undefined,
      { json: { name: "Zap" }, method: "POST" },
      { ...INTERNAL_DEFAULTS, headers: { Authorization: "Bearer token" } }
    );
    const init = fetchMock.mock.calls[0]?.[1] as RequestInit;
    const headers = new Headers(init.headers);

    expect(headers.get("Authorization")).toBe("Bearer token");
    expect(headers.get("Content-Type")).toBe("application/json");
  });

  it("leaves native body values untouched", async () => {
    const body = new FormData();
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ ok: true })));

    await fetchInternal(
      "upload",
      undefined,
      { body, method: "POST" },
      INTERNAL_DEFAULTS
    );
    const init = fetchMock.mock.calls[0]?.[1] as RequestInit;

    expect(init.body).toBe(body);
  });

  it("throws when json and body are both provided at runtime", async () => {
    // @ts-expect-error body and json are intentionally both provided to test the runtime guard.
    const options: ExtendedRequestInit = {
      body: "raw",
      json: { name: "Zap" },
      method: "POST",
    };

    await expect(
      fetchInternal("users", undefined, options, INTERNAL_DEFAULTS)
    ).rejects.toThrow(TypeError);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("uses Request instances as fetch Request inputs", async () => {
    const request = new Request("https://api.example.com/users", {
      headers: { A: "1" },
      method: "POST",
    });
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ ok: true })));

    await fetchInternal(
      request,
      undefined,
      { headers: { B: "2" } },
      INTERNAL_DEFAULTS
    );
    const [input, init] = fetchMock.mock.calls[0] as [Request, RequestInit];
    const headers = new Headers(init.headers);

    expect(input).toBeInstanceOf(Request);
    expect(input.url).toBe("https://api.example.com/users");
    expect(input.method).toBe("POST");
    expect(headers.get("A")).toBe("1");
    expect(headers.get("B")).toBe("2");
  });
});
