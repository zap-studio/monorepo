import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { $fetch, createFetch } from "../src/index.js";

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

  it("normalizes native Request inputs without losing browser Headers semantics", async () => {
    fetchMock.mockResolvedValue(new Response("ok"));
    const request = new Request("https://api.example.com/users", {
      headers: { A: "1", B: "2" },
      method: "POST",
    });

    await $fetch(request, { headers: { B: "20", C: "3" }, method: "PATCH" });

    const [sentRequest, init] = fetchMock.mock.calls[0] as [
      Request,
      RequestInit,
    ];
    const headers = new Headers(init.headers);

    expect(sentRequest).toBeInstanceOf(Request);
    expect(sentRequest).not.toBe(request);
    expect(sentRequest.url).toBe("https://api.example.com/users");
    expect(init.method).toBe("PATCH");
    expect([
      headers.get("A"),
      headers.get("B"),
      headers.get("C"),
    ]).toStrictEqual(["1", "20", "3"]);
  });

  it("merges native Headers, object headers, and tuple headers", async () => {
    fetchMock.mockResolvedValue(new Response("ok"));

    await $fetch("https://api.example.com/a", {
      headers: new Headers({ A: "1" }),
    });
    const fromHeaders = new Headers(fetchMock.mock.calls[0]?.[1]?.headers);

    fetchMock.mockClear();
    const { $fetch: objectFetch } = createFetch({ headers: { A: "1" } });
    await objectFetch("https://api.example.com/b", { headers: { B: "2" } });
    const fromObject = new Headers(fetchMock.mock.calls[0]?.[1]?.headers);

    fetchMock.mockClear();
    const { $fetch: tupleFetch } = createFetch({ headers: [["A", "1"]] });
    await tupleFetch("https://api.example.com/c", {
      headers: [["A", "2"]],
    });
    const fromTuples = new Headers(fetchMock.mock.calls[0]?.[1]?.headers);

    expect(fromHeaders.get("A")).toBe("1");
    expect(fromObject.get("A")).toBe("1");
    expect(fromObject.get("B")).toBe("2");
    expect(fromTuples.get("A")).toBe("2");
  });

  it("resolves browser URL and URLSearchParams inputs consistently", async () => {
    fetchMock.mockResolvedValue(new Response("ok"));
    const { $fetch: customFetch } = createFetch({
      baseURL: "https://api.example.com",
    });

    await customFetch("users#team", { searchParams: { q: "zap" } });
    expect(fetchMock.mock.calls[0]?.[0]).toBe(
      "https://api.example.com/users?q=zap#team"
    );

    fetchMock.mockClear();
    await $fetch("/docs/guide#intro", {
      searchParams: new URLSearchParams({ page: "1" }),
    });
    expect(fetchMock.mock.calls[0]?.[0]).toBe("/docs/guide?page=1#intro");
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
