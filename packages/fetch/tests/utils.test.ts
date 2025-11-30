import type { StandardSchemaV1 } from "@standard-schema/spec";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { $fetch } from "../src";
import {
  createMethod,
  fetchInternal,
  mergeHeaders,
} from "../src/internal/utils";
import type { ExtendedRequestInit } from "../src/types";

const RE_HTTP_500 = /HTTP 500: Server Error/;
const RE_HTTP_400 = /HTTP 400: Bad Request/;

describe("mergeHeaders", () => {
  describe("when both arguments are undefined", () => {
    it("should return undefined", () => {
      expect(mergeHeaders(undefined, undefined)).toBeUndefined();
    });
  });

  describe("when base is provided", () => {
    it("should return Headers with base values", () => {
      const result = mergeHeaders({ Authorization: "Bearer token" }, undefined);
      expect(result).toBeInstanceOf(Headers);
      expect(result?.get("Authorization")).toBe("Bearer token");
    });

    it("should handle HeadersInit as object", () => {
      const result = mergeHeaders({ A: "1", B: "2" }, undefined);
      expect(result?.get("A")).toBe("1");
      expect(result?.get("B")).toBe("2");
    });

    it("should handle HeadersInit as Headers instance", () => {
      const base = new Headers({ X: "x" });
      const result = mergeHeaders(base, undefined);
      expect(result?.get("X")).toBe("x");
    });

    it("should handle HeadersInit as array of tuples", () => {
      const tuples: [string, string][] = [
        ["K", "V"],
        ["C", "D"],
      ];
      const result = mergeHeaders(tuples, undefined);
      expect(result?.get("K")).toBe("V");
      expect(result?.get("C")).toBe("D");
    });
  });

  describe("when override is provided", () => {
    it("should return Headers with override values", () => {
      const result = mergeHeaders(undefined, { A: "a" });
      expect(result?.get("A")).toBe("a");
    });

    it("should handle HeadersInit as object", () => {
      const result = mergeHeaders(undefined, { A: "1", B: "2" });
      expect(result?.get("A")).toBe("1");
      expect(result?.get("B")).toBe("2");
    });

    it("should handle HeadersInit as Headers instance", () => {
      const override = new Headers({ Z: "z" });
      const result = mergeHeaders(undefined, override);
      expect(result?.get("Z")).toBe("z");
    });
  });

  describe("when both base and override are provided", () => {
    it("should merge headers with override taking precedence", () => {
      const result = mergeHeaders({ A: "1", B: "2" }, { B: "20", C: "3" });
      expect(result?.get("A")).toBe("1");
      expect(result?.get("B")).toBe("20");
      expect(result?.get("C")).toBe("3");
    });

    it("should keep base headers not present in override", () => {
      const result = mergeHeaders({ Keep: "yes" }, { Add: "new" });
      expect(result?.get("Keep")).toBe("yes");
    });

    it("should replace base headers present in override", () => {
      const result = mergeHeaders({ Replace: "old" }, { Replace: "new" });
      expect(result?.get("Replace")).toBe("new");
    });

    it("should add new headers from override", () => {
      const result = mergeHeaders({ Base: "b" }, { Added: "a" });
      expect(result?.get("Base")).toBe("b");
      expect(result?.get("Added")).toBe("a");
    });
  });
});

describe("fetchInternal", () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn<typeof fetch>();
    global.fetch = fetchMock as typeof fetch;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("URL construction", () => {
    it("should construct URL from baseURL and resource", async () => {
      fetchMock.mockResolvedValue(
        new Response(JSON.stringify({ ok: true }), { status: 200 })
      );
      await fetchInternal("endpoint", undefined, undefined, {
        baseURL: "https://api.example.com",
        headers: undefined,
        throwOnFetchError: true,
        throwOnValidationError: true,
      });
      expect(fetchMock).toHaveBeenCalledWith(
        "https://api.example.com/endpoint",
        expect.any(Object)
      );
    });

    it("should handle baseURL with trailing slash", async () => {
      fetchMock.mockResolvedValue(
        new Response(JSON.stringify({ ok: true }), { status: 200 })
      );
      await fetchInternal("endpoint", undefined, undefined, {
        baseURL: "https://api.example.com/",
        headers: undefined,
        throwOnFetchError: true,
        throwOnValidationError: true,
      });
      expect(fetchMock).toHaveBeenCalledWith(
        "https://api.example.com/endpoint",
        expect.any(Object)
      );
    });

    it("should handle resource with leading slash", async () => {
      fetchMock.mockResolvedValue(
        new Response(JSON.stringify({ ok: true }), { status: 200 })
      );
      await fetchInternal("/endpoint", undefined, undefined, {
        baseURL: "https://api.example.com",
        headers: undefined,
        throwOnFetchError: true,
        throwOnValidationError: true,
      });
      expect(fetchMock).toHaveBeenCalledWith(
        "https://api.example.com/endpoint",
        expect.any(Object)
      );
    });

    it("should handle both baseURL with trailing slash and resource with leading slash", async () => {
      fetchMock.mockResolvedValue(
        new Response(JSON.stringify({ ok: true }), { status: 200 })
      );
      await fetchInternal("/endpoint", undefined, undefined, {
        baseURL: "https://api.example.com/",
        headers: undefined,
        throwOnFetchError: true,
        throwOnValidationError: true,
      });
      expect(fetchMock).toHaveBeenCalledWith(
        "https://api.example.com/endpoint",
        expect.any(Object)
      );
    });

    it("should use resource as-is when no baseURL", async () => {
      fetchMock.mockResolvedValue(
        new Response(JSON.stringify({ ok: true }), { status: 200 })
      );
      await fetchInternal("/absolute", undefined, undefined, {
        baseURL: "",
        headers: undefined,
        throwOnFetchError: true,
        throwOnValidationError: true,
      });
      expect(fetchMock).toHaveBeenCalledWith("/absolute", expect.any(Object));
    });
  });

  describe("headers merging", () => {
    it("should merge default headers with request headers", async () => {
      fetchMock.mockResolvedValue(
        new Response(JSON.stringify({ ok: true }), { status: 200 })
      );
      await fetchInternal(
        "endpoint",
        undefined,
        { headers: { A: "1" } },
        {
          baseURL: "https://api.example.com",
          headers: { B: "2" },
          throwOnFetchError: true,
          throwOnValidationError: true,
        }
      );
      expect(fetchMock.mock.calls.length).toBeGreaterThan(0);
      const call = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
      const init = call[1];
      const headers = new Headers(init.headers);
      expect(headers.get("A")).toBe("1");
      expect(headers.get("B")).toBe("2");
    });

    it("should allow request headers to override default headers", async () => {
      fetchMock.mockResolvedValue(
        new Response(JSON.stringify({ ok: true }), { status: 200 })
      );
      await fetchInternal(
        "endpoint",
        undefined,
        { headers: { B: "override" } },
        {
          baseURL: "https://api.example.com",
          headers: { B: "base" },
          throwOnFetchError: true,
          throwOnValidationError: true,
        }
      );
      expect(fetchMock.mock.calls.length).toBeGreaterThan(0);
      const call = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
      const init = call[1];
      const headers = new Headers(init.headers);
      expect(headers.get("B")).toBe("override");
    });

    it("should work with no headers", async () => {
      fetchMock.mockResolvedValue(
        new Response(JSON.stringify({ ok: true }), { status: 200 })
      );
      await fetchInternal("endpoint", undefined, undefined, {
        baseURL: "https://api.example.com",
        headers: undefined,
        throwOnFetchError: true,
        throwOnValidationError: true,
      });
      expect(fetchMock.mock.calls.length).toBeGreaterThan(0);
      const call = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
      const init = call[1];
      expect(init.headers).toBeUndefined();
    });
  });

  describe("body handling", () => {
    const dummySchema = {
      "~standard": {
        version: 1,
        vendor: "standard-schema",
        validate: (input: unknown) => ({ value: input }),
      },
    } satisfies StandardSchemaV1;

    it("should stringify body when schema is provided", async () => {
      fetchMock.mockResolvedValue(
        new Response(JSON.stringify({ ok: true }), { status: 200 })
      );
      const body = { a: 1 };
      await fetchInternal(
        "endpoint",
        dummySchema,
        { method: "POST", body: JSON.stringify(body) },
        {
          baseURL: "https://api.example.com",
          headers: undefined,
          throwOnFetchError: true,
          throwOnValidationError: true,
        }
      );
      expect(fetchMock.mock.calls.length).toBeGreaterThan(0);
      const call = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
      const init = call[1];
      expect(typeof init.body).toBe("string");
      expect(init.body).toBe(JSON.stringify(body));
    });

    it("should set Content-Type to application/json when schema and body", async () => {
      fetchMock.mockResolvedValue(
        new Response(JSON.stringify({ ok: true }), { status: 200 })
      );
      await fetchInternal(
        "endpoint",
        dummySchema,
        { method: "POST", body: JSON.stringify({ a: 1 }) },
        {
          baseURL: "https://api.example.com",
          headers: undefined,
          throwOnFetchError: true,
          throwOnValidationError: true,
        }
      );
      expect(fetchMock.mock.calls.length).toBeGreaterThan(0);
      const call = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
      const init = call[1];
      const headers = new Headers(init.headers);
      expect(headers.get("Content-Type")).toBe("application/json");
    });

    it("should not override existing Content-Type header", async () => {
      fetchMock.mockResolvedValue(
        new Response(JSON.stringify({ ok: true }), { status: 200 })
      );
      await fetchInternal(
        "endpoint",
        dummySchema,
        {
          method: "POST",
          body: JSON.stringify({ a: 1 }),
          headers: { "Content-Type": "text/plain" },
        },
        {
          baseURL: "https://api.example.com",
          headers: undefined,
          throwOnFetchError: true,
          throwOnValidationError: true,
        }
      );
      expect(fetchMock.mock.calls.length).toBeGreaterThan(0);
      const call = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
      const init = call[1];
      const headers = new Headers(init.headers);
      expect(headers.get("Content-Type")).toBe("text/plain");
    });

    it("should not stringify body when no schema is provided", async () => {
      fetchMock.mockResolvedValue(
        new Response(JSON.stringify({ ok: true }), { status: 200 })
      );
      const body = new Blob(["raw"], { type: "text/plain" });
      await fetchInternal(
        "endpoint",
        undefined,
        { method: "POST", body },
        {
          baseURL: "https://api.example.com",
          headers: undefined,
          throwOnFetchError: true,
          throwOnValidationError: true,
        }
      );
      expect(fetchMock.mock.calls.length).toBeGreaterThan(0);
      const call = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
      const init = call[1];
      expect(init.body).toBe(body);
    });
  });

  describe("error handling", () => {
    it("should throw FetchError on non-ok response when throwOnFetchError is true", async () => {
      fetchMock.mockResolvedValue(
        new Response("Bad", { status: 500, statusText: "Server Error" })
      );
      await expect(
        fetchInternal("endpoint", undefined, undefined, {
          baseURL: "https://api.example.com",
          headers: undefined,
          throwOnFetchError: true,
          throwOnValidationError: true,
        })
      ).rejects.toThrow(RE_HTTP_500);
    });

    it("should not throw on non-ok response when throwOnFetchError is false", async () => {
      fetchMock.mockResolvedValue(
        new Response("Bad", { status: 404, statusText: "Not Found" })
      );
      const result = await fetchInternal("endpoint", undefined, undefined, {
        baseURL: "https://api.example.com",
        headers: undefined,
        throwOnFetchError: false,
        throwOnValidationError: true,
      });
      expect(result).toBeInstanceOf(Response);
      const res = result as Response;
      expect(res.status).toBe(404);
    });

    it("should include status and statusText in FetchError message", async () => {
      fetchMock.mockResolvedValue(
        new Response("Bad", { status: 400, statusText: "Bad Request" })
      );
      await expect(
        fetchInternal("endpoint", undefined, undefined, {
          baseURL: "https://api.example.com",
          headers: undefined,
          throwOnFetchError: true,
          throwOnValidationError: true,
        })
      ).rejects.toThrow(RE_HTTP_400);
    });
  });

  describe("response handling", () => {
    it("should return raw Response when no schema is provided", async () => {
      fetchMock.mockResolvedValue(
        new Response(JSON.stringify({ ok: true }), { status: 200 })
      );
      const result = await fetchInternal("endpoint", undefined, undefined, {
        baseURL: "https://api.example.com",
        headers: undefined,
        throwOnFetchError: true,
        throwOnValidationError: true,
      });
      expect(result).toBeInstanceOf(Response);
    });

    it("should parse JSON and validate when schema is provided", async () => {
      fetchMock.mockResolvedValue(
        new Response(JSON.stringify({ value: 42 }), { status: 200 })
      );
      const schema = {
        "~standard": {
          version: 1,
          vendor: "standard-schema",
          validate: (input: unknown) => ({ value: input }),
        },
      } satisfies StandardSchemaV1;
      const result = await fetchInternal("endpoint", schema, undefined, {
        baseURL: "https://api.example.com",
        headers: undefined,
        throwOnFetchError: true,
        throwOnValidationError: true,
      });
      // When throwOnValidationError is true, standardValidate returns the validated value
      expect(result).toEqual({ value: 42 });
    });

    it("should return validated value when throwOnValidationError is true", async () => {
      fetchMock.mockResolvedValue(
        new Response(JSON.stringify({ val: "x" }), { status: 200 })
      );
      const schema = {
        "~standard": {
          version: 1,
          vendor: "standard-schema",
          validate: (input: unknown) => ({ value: input }),
        },
      } satisfies StandardSchemaV1;
      const result = await fetchInternal("endpoint", schema, undefined, {
        baseURL: "https://api.example.com",
        headers: undefined,
        throwOnFetchError: true,
        throwOnValidationError: true,
      });
      expect(result).toEqual({ val: "x" });
    });

    it("should return result object when throwOnValidationError is false", async () => {
      fetchMock.mockResolvedValue(
        new Response(JSON.stringify({ val: "x" }), { status: 200 })
      );
      // Create a schema that produces issues when parse called
      const schema = {
        "~standard": {
          version: 1,
          vendor: "standard-schema",
          validate: (_input: unknown) => ({
            issues: [{ message: "err", path: ["x"] }],
          }),
        },
      } satisfies StandardSchemaV1;
      const result = await fetchInternal("endpoint", schema, undefined, {
        baseURL: "https://api.example.com",
        headers: undefined,
        throwOnFetchError: true,
        throwOnValidationError: false,
      });
      expect(result).toEqual({ issues: [{ message: "err", path: ["x"] }] });
    });
  });

  describe("defaults handling", () => {
    it("should use throwOnValidationError from defaults", async () => {
      fetchMock.mockResolvedValue(
        new Response(JSON.stringify({ val: "x" }), { status: 200 })
      );
      const schema = {
        "~standard": {
          version: 1,
          vendor: "standard-schema",
          validate: (_input: unknown) => ({
            issues: [{ message: "bad", path: ["x"] }],
          }),
        },
      } satisfies StandardSchemaV1;
      const result = await fetchInternal("endpoint", schema, undefined, {
        baseURL: "https://api.example.com",
        headers: undefined,
        throwOnFetchError: true,
        throwOnValidationError: false,
      });
      expect(result).toEqual({ issues: [{ message: "bad", path: ["x"] }] });
    });

    it("should use throwOnFetchError from defaults", async () => {
      fetchMock.mockResolvedValue(
        new Response("Bad", { status: 500, statusText: "Server Error" })
      );
      await expect(
        fetchInternal("endpoint", undefined, undefined, {
          baseURL: "https://api.example.com",
          headers: undefined,
          throwOnFetchError: true,
          throwOnValidationError: true,
        })
      ).rejects.toThrow();
    });

    it("should allow options to override defaults", async () => {
      fetchMock.mockResolvedValue(
        new Response("Bad", { status: 500, statusText: "Server Error" })
      );
      const result = await fetchInternal(
        "endpoint",
        undefined,
        { method: "GET" },
        {
          baseURL: "https://api.example.com",
          headers: undefined,
          throwOnFetchError: false,
          throwOnValidationError: true,
        }
      );
      expect(result).toBeInstanceOf(Response);
    });
  });
});

describe("createMethod", () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn<typeof fetch>();
    global.fetch = fetchMock as typeof fetch;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("method creation", () => {
    it("should return a function", () => {
      const method = createMethod(vi.fn() as unknown as typeof $fetch, "GET");
      expect(typeof method).toBe("function");
    });

    it("should create a method bound to the provided fetch function", async () => {
      const $fetchMock = vi.fn(async (...args: Parameters<typeof $fetch>) => {
        await Promise.resolve();
        return args;
      }) as unknown as typeof $fetch;

      const get = createMethod($fetchMock, "GET");
      const schema = {
        "~standard": {
          version: 1,
          vendor: "standard-schema",
          validate: (i: unknown) => ({ value: i }),
        },
      } satisfies StandardSchemaV1;
      const result = await get("resource", schema, { headers: { A: "1" } });
      expect(result).toBeDefined();
    });
  });

  describe("method invocation", () => {
    it("should call fetch with the specified HTTP method", async () => {
      const $fetchMock = vi.fn(() =>
        Promise.resolve(undefined)
      ) as unknown as typeof $fetch;
      const post = createMethod($fetchMock, "POST");
      const schema = {
        "~standard": {
          version: 1,
          vendor: "standard-schema",
          validate: (i: unknown) => ({ value: i }),
        },
      } satisfies StandardSchemaV1;
      await post("res", schema, { body: JSON.stringify({ a: 1 }) });
      const call = (vi.mocked($fetchMock).mock.calls[0] ?? []) as unknown[];
      expect(call[2]).toMatchObject({ method: "POST" });
    });

    it("should pass resource to fetch", async () => {
      const $fetchMock = vi.fn(() =>
        Promise.resolve(undefined)
      ) as unknown as typeof $fetch;
      const get = createMethod($fetchMock, "GET");
      const schema = {
        "~standard": {
          version: 1,
          vendor: "standard-schema",
          validate: (i: unknown) => ({ value: i }),
        },
      } satisfies StandardSchemaV1;
      await get("/users", schema);
      const call = (vi.mocked($fetchMock).mock.calls[0] ?? []) as unknown[];
      expect(call[0]).toBe("/users");
    });

    it("should pass schema to fetch", async () => {
      const $fetchMock = vi.fn(() =>
        Promise.resolve(undefined)
      ) as unknown as typeof $fetch;
      const get = createMethod($fetchMock, "GET");
      const schema = {
        "~standard": {
          version: 1,
          vendor: "standard-schema",
          validate: (i: unknown) => ({ value: i }),
        },
      } satisfies StandardSchemaV1;
      await get("/users", schema);
      const call = (vi.mocked($fetchMock).mock.calls[0] ?? []) as unknown[];
      expect(call[1]).toBe(schema);
    });

    it("should merge options with method", async () => {
      const $fetchMock = vi.fn(() =>
        Promise.resolve(undefined)
      ) as unknown as typeof $fetch;
      const patch = createMethod($fetchMock, "PATCH");
      const schema = {
        "~standard": {
          version: 1,
          vendor: "standard-schema",
          validate: (i: unknown) => ({ value: i }),
        },
      } satisfies StandardSchemaV1;
      await patch("/users/1", schema, {
        headers: { A: "1" },
        body: JSON.stringify({ name: "x" }),
      });
      const call = (vi.mocked($fetchMock).mock.calls[0] ?? []) as unknown[];
      expect(call[2]).toMatchObject({
        method: "PATCH",
        headers: { A: "1" },
        body: { name: "x" },
      });
    });

    it("should not allow overriding method via options", async () => {
      const $fetchMock = vi.fn(() =>
        Promise.resolve(undefined)
      ) as unknown as typeof $fetch;
      const del = createMethod($fetchMock, "DELETE");
      const schema = {
        "~standard": {
          version: 1,
          vendor: "standard-schema",
          validate: (i: unknown) => ({ value: i }),
        },
      } satisfies StandardSchemaV1;
      const badOptions = { method: "GET" } as unknown as Omit<
        ExtendedRequestInit,
        "method"
      >;
      await del("/users/1", schema, badOptions);
      const call = (vi.mocked($fetchMock).mock.calls[0] ?? []) as unknown[];
      expect(call[2]).toMatchObject({ method: "DELETE" });
    });
  });

  describe("different HTTP methods", () => {
    const schema = {
      "~standard": {
        version: 1,
        vendor: "standard-schema",
        validate: (i: unknown) => ({ value: i }),
      },
    } satisfies StandardSchemaV1;

    it("should work with GET method", async () => {
      const $fetchMock = vi.fn(() =>
        Promise.resolve(undefined)
      ) as unknown as typeof $fetch;
      const get = createMethod($fetchMock, "GET");
      await get("/r", schema);
      const call = (vi.mocked($fetchMock).mock.calls[0] ?? []) as unknown[];
      expect(call[2]).toMatchObject({ method: "GET" });
    });

    it("should work with POST method", async () => {
      const $fetchMock = vi.fn(() =>
        Promise.resolve(undefined)
      ) as unknown as typeof $fetch;
      const post = createMethod($fetchMock, "POST");
      await post("/r", schema, { body: JSON.stringify({ a: 1 }) });
      const call = (vi.mocked($fetchMock).mock.calls[0] ?? []) as unknown[];
      expect(call[2]).toMatchObject({ method: "POST" });
    });

    it("should work with PUT method", async () => {
      const $fetchMock = vi.fn(async () => {
        // do nothing
      }) as unknown as typeof $fetch;
      const put = createMethod($fetchMock, "PUT");
      await put("/r", schema, { body: JSON.stringify({ a: 1 }) });
      const call = (vi.mocked($fetchMock).mock.calls[0] ?? []) as unknown[];
      expect(call[2]).toMatchObject({ method: "PUT" });
    });

    it("should work with PATCH method", async () => {
      const $fetchMock = vi.fn(async () => {
        // do nothing
      }) as unknown as typeof $fetch;
      const patch = createMethod($fetchMock, "PATCH");
      await patch("/r", schema, { body: JSON.stringify({ a: 1 }) });
      const call = (vi.mocked($fetchMock).mock.calls[0] ?? []) as unknown[];
      expect(call[2]).toMatchObject({ method: "PATCH" });
    });

    it("should work with DELETE method", async () => {
      const $fetchMock = vi.fn(async () => {
        // do nothing
      }) as unknown as typeof $fetch;
      const del = createMethod($fetchMock, "DELETE");
      await del("/r", schema);
      const call = (vi.mocked($fetchMock).mock.calls[0] ?? []) as unknown[];
      expect(call[2]).toMatchObject({ method: "DELETE" });
    });
  });
});
