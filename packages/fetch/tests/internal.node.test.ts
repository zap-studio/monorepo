import type { StandardSchemaV1 } from "@zap-studio/validation";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { FetchError } from "../src/errors.js";
import { fetchInternal } from "../src/internal.js";
import type { ExtendedRequestInit, FetchDefaults } from "../src/types.js";

const DEFAULTS: FetchDefaults = {
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
      fetchInternal("users", undefined, undefined, DEFAULTS)
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
      fetchInternal("users", undefined, undefined, DEFAULTS)
    ).rejects.toThrow(FetchError);
  });

  it("can return non-ok responses when fetch errors are disabled", async () => {
    const response = new Response("Nope", {
      status: 404,
      statusText: "Not Found",
    });
    fetchMock.mockResolvedValue(response);

    await expect(
      fetchInternal("users", undefined, { throwOnFetchError: false }, DEFAULTS)
    ).resolves.toBe(response);
  });

  it("validates JSON responses when a schema is provided", async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ id: 1 })));

    await expect(
      fetchInternal("users/1", passSchema, undefined, DEFAULTS)
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
        DEFAULTS
      )
    ).resolves.toStrictEqual({ issues: [{ message: "Invalid value" }] });
  });

  it("uses default validation error behavior when options do not override it", async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ id: "bad" })));

    await expect(
      fetchInternal("users/1", failSchema, undefined, {
        ...DEFAULTS,
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
      { ...DEFAULTS, headers: { A: "1" } }
    );
    const init = fetchMock.mock.calls[0]?.[1] as RequestInit;
    const headers = new Headers(init.headers);

    expect(headers.get("A")).toBe("1");
    expect(headers.get("B")).toBe("2");
  });

  it("stringifies json and adds a JSON content type", async () => {
    const json = { name: "Zap" };
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ ok: true })));

    await fetchInternal("users", undefined, { json, method: "POST" }, DEFAULTS);
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
      DEFAULTS
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
      { ...DEFAULTS, headers: { Authorization: "Bearer token" } }
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
      DEFAULTS
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
      fetchInternal("users", undefined, options, DEFAULTS)
    ).rejects.toThrow(TypeError);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("uses Request instances as fetch Request inputs", async () => {
    const request = new Request("https://api.example.com/users", {
      headers: { A: "1" },
      method: "POST",
    });
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ ok: true })));

    await fetchInternal(request, undefined, { headers: { B: "2" } }, DEFAULTS);
    const [input, init] = fetchMock.mock.calls[0] as [Request, RequestInit];
    const headers = new Headers(init.headers);

    expect(input).toBeInstanceOf(Request);
    expect(input.url).toBe("https://api.example.com/users");
    expect(input.method).toBe("POST");
    expect(headers.get("A")).toBe("1");
    expect(headers.get("B")).toBe("2");
  });
});
