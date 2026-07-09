import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { mergeHeaders } from "../src/headers.js";
import { $fetch, createFetch } from "../src/index.js";
import { normalizeRequest } from "../src/request.js";
import { resolveRequestUrl } from "../src/url.js";

const DEFAULTS = {
  baseURL: "",
  throwOnFetchError: true,
  throwOnValidationError: true,
};

describe("@zap-studio/fetch browser runtime", () => {
  let originalFetch: typeof globalThis.fetch;
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    originalFetch = globalThis.fetch;
    fetchMock = vi.fn<typeof fetch>();
    globalThis.fetch = fetchMock as typeof fetch;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it("normalizes native Request inputs without losing browser Headers semantics", () => {
    const request = new Request("https://api.example.com/users", {
      headers: { A: "1", B: "2" },
      method: "POST",
    });

    const normalized = normalizeRequest(request, {
      headers: { B: "20", C: "3" },
      method: "PATCH",
    });
    const headers = new Headers(normalized.options.headers);

    expect(normalized).toMatchObject({
      options: { method: "PATCH" },
      url: "https://api.example.com/users",
    });
    expect(normalized.request).toBeInstanceOf(Request);
    expect(normalized.request).not.toBe(request);
    expect([
      headers.get("A"),
      headers.get("B"),
      headers.get("C"),
    ]).toStrictEqual(["1", "20", "3"]);
  });

  it("merges native Headers, object headers, and tuple headers", () => {
    const fromHeaders = mergeHeaders(new Headers({ A: "1" }));
    const fromObject = mergeHeaders({ A: "1" }, { B: "2" });
    const fromTuples = mergeHeaders([["A", "1"]], [["A", "2"]]);

    expect(fromHeaders?.get("A")).toBe("1");
    expect(fromObject?.get("A")).toBe("1");
    expect(fromObject?.get("B")).toBe("2");
    expect(fromTuples?.get("A")).toBe("2");
  });

  it("resolves browser URL and URLSearchParams inputs consistently", () => {
    expect(
      resolveRequestUrl(
        "users#team",
        { ...DEFAULTS, baseURL: "https://api.example.com" },
        {
          q: "zap",
        }
      )
    ).toBe("https://api.example.com/users?q=zap#team");

    expect(
      resolveRequestUrl(
        "/docs/guide#intro",
        DEFAULTS,
        new URLSearchParams({ page: "1" })
      )
    ).toBe("/docs/guide?page=1#intro");
  });

  it("returns native Response objects from raw $fetch calls", async () => {
    const response = new Response(JSON.stringify({ ok: true }), {
      headers: { "content-type": "application/json" },
      status: 201,
    });
    fetchMock.mockResolvedValue(response);

    const result = await $fetch("https://api.example.com/users", {
      headers: { Accept: "application/json" },
    });

    expect(result).toBe(response);
    expect(result).toBeInstanceOf(Response);
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.example.com/users",
      expect.objectContaining({
        headers: expect.any(Headers),
      })
    );
  });

  it("uses Request inputs as native fetch Request arguments", async () => {
    fetchMock.mockResolvedValue(new Response("ok"));

    await $fetch(
      new Request("https://api.example.com/users", {
        headers: { A: "1" },
        method: "POST",
      }),
      {
        headers: { B: "2" },
      }
    );

    const firstCall = fetchMock.mock.calls[0];
    const [request, init] = firstCall;
    expect(request).toBeInstanceOf(Request);
    expect((request as Request).url).toBe("https://api.example.com/users");
    expect(new Headers((init as RequestInit).headers).get("B")).toBe("2");
  });

  it("serializes json bodies and preserves explicit content type casing", async () => {
    fetchMock.mockResolvedValue(new Response("ok"));

    await $fetch("https://api.example.com/users", {
      headers: { "content-type": "application/vnd.api+json" },
      json: { name: "Zap" },
      method: "POST",
    });

    const firstCall = fetchMock.mock.calls[0];
    const [, init] = firstCall;
    expect((init as RequestInit).body).toBe(JSON.stringify({ name: "Zap" }));
    expect(new Headers((init as RequestInit).headers).get("content-type")).toBe(
      "application/vnd.api+json"
    );
  });

  it("applies browser fetch defaults from createFetch", async () => {
    fetchMock.mockResolvedValue(new Response("ok"));
    const client = createFetch({
      baseURL: "https://api.example.com",
      headers: { Authorization: "Bearer token" },
    });

    await client.$fetch("/users", {
      headers: { Accept: "application/json" },
      searchParams: { page: "1" },
    });

    const firstCall = fetchMock.mock.calls[0];
    const [url, init] = firstCall;
    const headers = new Headers((init as RequestInit).headers);
    expect(url).toBe("https://api.example.com/users?page=1");
    expect(headers.get("authorization")).toBe("Bearer token");
    expect(headers.get("accept")).toBe("application/json");
  });
});
