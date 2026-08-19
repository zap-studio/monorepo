import type { Logger } from "@zap-studio/logger";

import { isErr, isOk } from "@zap-studio/monads";
import { isStandardSchema } from "@zap-studio/validation";
import { ValidationError } from "@zap-studio/validation/errors";
import { type } from "arktype";
import * as v from "valibot";
import { number, object, string } from "valibot";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";

import { FetchError } from "./errors.ts";
import { $fetch, $fetchResult, api, apiResult, createFetch, GLOBAL_DEFAULTS } from "./index.ts";

const createRecordingLogger = (): Logger & {
  calls: {
    level: string;
    message: string;
    context: Record<string, unknown> | undefined;
  }[];
} => {
  const calls: {
    level: string;
    message: string;
    context: Record<string, unknown> | undefined;
  }[] = [];
  const record =
    (level: string) =>
    (message: string, context?: Record<string, unknown>): void => {
      calls.push({ context, level, message });
    };

  return {
    calls,
    debug: record("debug"),
    error: record("error"),
    fatal: record("fatal"),
    info: record("info"),
    trace: record("trace"),
    warn: record("warn"),
  };
};

async function captureRejectedError(run: () => Promise<unknown>): Promise<unknown> {
  try {
    await run();
  } catch (error) {
    return error;
  }

  throw new Error("Expected promise to reject");
}

describe($fetch, () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn<typeof fetch>();
    globalThis.fetch = fetchMock as typeof fetch;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("basic functionality", () => {
    it("should make a fetch request to the given URL", async () => {
      const mockResponse = new Response(JSON.stringify({ data: "test" }), {
        status: 200,
      });
      fetchMock.mockResolvedValue(mockResponse);

      await $fetch("https://api.example.com/test");

      expect(fetchMock).toHaveBeenCalledWith("https://api.example.com/test", expect.any(Object));
    });

    it("should return raw Response when no schema is provided", async () => {
      const mockResponse = new Response(JSON.stringify({ data: "test" }), {
        status: 200,
      });
      fetchMock.mockResolvedValue(mockResponse);

      const result = await $fetch("https://api.example.com/test");

      expect(result).toBeInstanceOf(Response);
      expect(result).toBe(mockResponse);
    });

    it("should pass RequestInit options to fetch", async () => {
      const mockResponse = new Response(JSON.stringify({ data: "test" }), {
        status: 200,
      });
      fetchMock.mockResolvedValue(mockResponse);

      await $fetch("https://api.example.com/test", {
        credentials: "include",
        method: "POST",
        mode: "cors",
      });

      expect(fetchMock).toHaveBeenCalledWith(
        "https://api.example.com/test",
        expect.objectContaining({
          credentials: "include",
          method: "POST",
          mode: "cors",
        }),
      );
    });

    it("should support all HTTP methods via options.method", async () => {
      const methods = ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD"];

      for (const method of methods) {
        const mockResponse = new Response(JSON.stringify({ data: "test" }), {
          status: 200,
        });
        fetchMock.mockResolvedValue(mockResponse);

        await $fetch("https://api.example.com/test", { method });

        expect(fetchMock).toHaveBeenCalledWith(
          "https://api.example.com/test",
          expect.objectContaining({ method }),
        );

        fetchMock.mockClear();
      }
    });
  });

  describe("schema validation", () => {
    const UserSchema = object({
      id: number(),
      name: string(),
    });

    it("should validate response data against the provided schema", async () => {
      const userData = { id: 1, name: "John" };
      const mockResponse = new Response(JSON.stringify(userData), {
        status: 200,
      });
      fetchMock.mockResolvedValue(mockResponse);

      const result = await $fetch("https://api.example.com/user", UserSchema);

      expect(result).toStrictEqual(userData);
    });

    it("should return validated data when schema validation passes", async () => {
      const userData = { id: 42, name: "Jane Doe" };
      const mockResponse = new Response(JSON.stringify(userData), {
        status: 200,
      });
      fetchMock.mockResolvedValue(mockResponse);

      const result = await $fetch("https://api.example.com/user", UserSchema);

      expect(result).toStrictEqual(userData);
      expect(result).toHaveProperty("id", 42);
      expect(result).toHaveProperty("name", "Jane Doe");
    });

    it("should throw ValidationError when validation fails and throwOnValidationError is true (default)", async () => {
      const invalidData = { id: "not-a-number", name: 123 };
      const mockResponse = new Response(JSON.stringify(invalidData), {
        status: 200,
      });
      fetchMock.mockResolvedValue(mockResponse);

      await expect($fetch("https://api.example.com/user", UserSchema)).rejects.toThrow(
        ValidationError,
      );
    });

    it("should return result object with issues when validation fails and throwOnValidationError is false", async () => {
      const invalidData = { id: "not-a-number", name: 123 };
      const mockResponse = new Response(JSON.stringify(invalidData), {
        status: 200,
      });
      fetchMock.mockResolvedValue(mockResponse);

      const result = await $fetch("https://api.example.com/user", UserSchema, {
        throwOnValidationError: false,
      });

      expect(result).toHaveProperty("issues");
      expect(Array.isArray((result as { issues: unknown[] }).issues)).toBeTruthy();
    });

    it("should return result object with value when validation passes and throwOnValidationError is false", async () => {
      const userData = { id: 1, name: "John" };
      const mockResponse = new Response(JSON.stringify(userData), {
        status: 200,
      });
      fetchMock.mockResolvedValue(mockResponse);

      const result = await $fetch("https://api.example.com/user", UserSchema, {
        throwOnValidationError: false,
      });

      expect(result).toHaveProperty("value");
      expect((result as { value: unknown }).value).toStrictEqual(userData);
    });

    it("should parse response as JSON when schema is provided", async () => {
      const userData = { id: 1, name: "John" };
      const mockResponse = new Response(JSON.stringify(userData), {
        status: 200,
      });
      const jsonSpy = vi.spyOn(mockResponse, "json");
      fetchMock.mockResolvedValue(mockResponse);

      await $fetch("https://api.example.com/user", UserSchema);

      expect(jsonSpy).toHaveBeenCalledWith();
    });
  });

  describe("error handling", () => {
    it("should throw FetchError on non-ok response when throwOnFetchError is true (default)", async () => {
      const mockResponse = new Response(JSON.stringify({ error: "Not Found" }), {
        status: 404,
        statusText: "Not Found",
      });
      fetchMock.mockResolvedValue(mockResponse);

      await expect($fetch("https://api.example.com/missing")).rejects.toThrow(FetchError);
    });

    it("should return Response without throwing when throwOnFetchError is false", async () => {
      const mockResponse = new Response(JSON.stringify({ error: "Not Found" }), {
        status: 404,
        statusText: "Not Found",
      });
      fetchMock.mockResolvedValue(mockResponse);

      const result = await $fetch("https://api.example.com/missing", {
        throwOnFetchError: false,
      });

      expect(result).toBeInstanceOf(Response);
      expect(result.status).toBe(404);
    });

    it("should include status and response in FetchError", async () => {
      const mockResponse = new Response(JSON.stringify({ error: "Server Error" }), {
        status: 500,
        statusText: "Internal Server Error",
      });
      fetchMock.mockResolvedValue(mockResponse);

      const error = await captureRejectedError(
        async () => await $fetch("https://api.example.com/error"),
      );

      expect(error).toBeInstanceOf(FetchError);
      expect((error as FetchError).status).toBe(500);
      expect((error as FetchError).response).toBe(mockResponse);
    });

    it("should include status text in FetchError message", async () => {
      const mockResponse = new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        statusText: "Forbidden",
      });
      fetchMock.mockResolvedValue(mockResponse);

      const error = await captureRejectedError(
        async () => await $fetch("https://api.example.com/forbidden"),
      );

      expect(error).toBeInstanceOf(FetchError);
      expect((error as FetchError).message).toContain("403");
      expect((error as FetchError).message).toContain("Forbidden");
    });
  });

  describe("headers", () => {
    const UserSchema = object({
      id: number(),
      name: string(),
    });

    it("should pass custom headers to fetch", async () => {
      const mockResponse = new Response(JSON.stringify({ data: "test" }), {
        status: 200,
      });
      fetchMock.mockResolvedValue(mockResponse);

      await $fetch("https://api.example.com/test", {
        headers: {
          Authorization: "Bearer token123",
          "X-Custom-Header": "custom-value",
        },
      });

      const calledHeaders = fetchMock.mock.calls[0]?.[1]?.headers as Headers;
      expect(calledHeaders.get("Authorization")).toBe("Bearer token123");
      expect(calledHeaders.get("X-Custom-Header")).toBe("custom-value");
    });

    it("should auto-set Content-Type to application/json when schema and json are provided", async () => {
      const userData = { id: 1, name: "John" };
      const mockResponse = new Response(JSON.stringify(userData), {
        status: 200,
      });
      fetchMock.mockResolvedValue(mockResponse);

      await $fetch("https://api.example.com/user", UserSchema, {
        json: { name: "New User" },
        method: "POST",
      });

      const calledHeaders = fetchMock.mock.calls[0]?.[1]?.headers as Headers;
      expect(calledHeaders.get("Content-Type")).toBe("application/json");
    });

    it("should not override existing Content-Type header", async () => {
      const userData = { id: 1, name: "John" };
      const mockResponse = new Response(JSON.stringify(userData), {
        status: 200,
      });
      fetchMock.mockResolvedValue(mockResponse);

      await $fetch("https://api.example.com/user", UserSchema, {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
        },
        json: { name: "New User" },
        method: "POST",
      });

      const calledHeaders = fetchMock.mock.calls[0]?.[1]?.headers as Headers;
      expect(calledHeaders.get("Content-Type")).toBe("application/json; charset=utf-8");
    });
  });

  describe("body handling", () => {
    const UserSchema = object({
      id: number(),
      name: string(),
    });

    it("should stringify json when schema is provided", async () => {
      const userData = { id: 1, name: "John" };
      const mockResponse = new Response(JSON.stringify(userData), {
        status: 200,
      });
      fetchMock.mockResolvedValue(mockResponse);

      const bodyData = { email: "user@example.com", name: "New User" };
      await $fetch("https://api.example.com/user", UserSchema, {
        json: bodyData,
        method: "POST",
      });

      const calledBody = fetchMock.mock.calls[0]?.[1]?.body;
      expect(calledBody).toBe(JSON.stringify(bodyData));
    });

    it("should stringify plain object json when no schema is provided", async () => {
      const mockResponse = new Response(JSON.stringify({ success: true }), {
        status: 200,
      });
      fetchMock.mockResolvedValue(mockResponse);

      const bodyData = { email: "user@example.com", name: "New User" };
      await $fetch("https://api.example.com/user", {
        json: bodyData,
        method: "POST",
      });

      const calledBody = fetchMock.mock.calls[0]?.[1]?.body;
      expect(calledBody).toBe(JSON.stringify(bodyData));
      const calledHeaders = new Headers(fetchMock.mock.calls[0]?.[1]?.headers);
      expect(calledHeaders.get("Content-Type")).toBe("application/json");
    });

    it("should stringify array json when no schema is provided", async () => {
      const mockResponse = new Response(JSON.stringify({ success: true }), {
        status: 200,
      });
      fetchMock.mockResolvedValue(mockResponse);

      const bodyData = [{ token_id: "token_123" }];
      await $fetch("https://api.example.com/user", {
        json: bodyData,
        method: "POST",
      });

      const calledBody = fetchMock.mock.calls[0]?.[1]?.body;
      expect(calledBody).toBe(JSON.stringify(bodyData));
      const calledHeaders = new Headers(fetchMock.mock.calls[0]?.[1]?.headers);
      expect(calledHeaders.get("Content-Type")).toBe("application/json");
    });

    it("should not stringify body when no schema is provided", async () => {
      const mockResponse = new Response(JSON.stringify({ success: true }), {
        status: 200,
      });
      fetchMock.mockResolvedValue(mockResponse);

      const formData = new FormData();
      formData.append("file", "test-content");

      await $fetch("https://api.example.com/upload", {
        body: formData,
        method: "POST",
      });

      const calledBody = fetchMock.mock.calls[0]?.[1]?.body;
      expect(calledBody).toBe(formData);
    });
  });
});

describe(createFetch, () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn<typeof fetch>();
    globalThis.fetch = fetchMock as typeof fetch;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("factory creation", () => {
    it("should return an object with $fetch and api properties", () => {
      const instance = createFetch();

      expect(instance).toHaveProperty("$fetch");
      expect(instance).toHaveProperty("api");
      expect(instance.$fetch).toBeTypeOf("function");
      expect(instance.api).toBeTypeOf("object");
    });

    it("should create independent fetch instances", async () => {
      const mockResponse = new Response(JSON.stringify({ data: "test" }), {
        status: 200,
      });
      fetchMock.mockResolvedValue(mockResponse);

      const instance1 = createFetch({ baseURL: "https://api1.example.com" });
      const instance2 = createFetch({ baseURL: "https://api2.example.com" });

      await instance1.$fetch("/endpoint");
      expect(fetchMock).toHaveBeenCalledWith(
        "https://api1.example.com/endpoint",
        expect.any(Object),
      );

      fetchMock.mockClear();

      await instance2.$fetch("/endpoint");
      expect(fetchMock).toHaveBeenCalledWith(
        "https://api2.example.com/endpoint",
        expect.any(Object),
      );
    });
  });

  describe("baseURL", () => {
    it("should prepend baseURL to relative paths", async () => {
      const mockResponse = new Response(JSON.stringify({ data: "test" }), {
        status: 200,
      });
      fetchMock.mockResolvedValue(mockResponse);

      const { $fetch: customFetch } = createFetch({
        baseURL: "https://api.example.com",
      });

      await customFetch("users");

      expect(fetchMock).toHaveBeenCalledWith("https://api.example.com/users", expect.any(Object));
    });

    it("should handle baseURL with trailing slash", async () => {
      const mockResponse = new Response(JSON.stringify({ data: "test" }), {
        status: 200,
      });
      fetchMock.mockResolvedValue(mockResponse);

      const { $fetch: customFetch } = createFetch({
        baseURL: "https://api.example.com/",
      });

      await customFetch("users");

      expect(fetchMock).toHaveBeenCalledWith("https://api.example.com/users", expect.any(Object));
    });

    it("should handle input with leading slash", async () => {
      const mockResponse = new Response(JSON.stringify({ data: "test" }), {
        status: 200,
      });
      fetchMock.mockResolvedValue(mockResponse);

      const { $fetch: customFetch } = createFetch({
        baseURL: "https://api.example.com",
      });

      await customFetch("/users");

      expect(fetchMock).toHaveBeenCalledWith("https://api.example.com/users", expect.any(Object));
    });

    it("should handle both baseURL with trailing and input with leading slash", async () => {
      const mockResponse = new Response(JSON.stringify({ data: "test" }), {
        status: 200,
      });
      fetchMock.mockResolvedValue(mockResponse);

      const { $fetch: customFetch } = createFetch({
        baseURL: "https://api.example.com/",
      });

      await customFetch("/users");

      expect(fetchMock).toHaveBeenCalledWith("https://api.example.com/users", expect.any(Object));
    });

    it("should not modify absolute URLs", async () => {
      const mockResponse = new Response(JSON.stringify({ data: "test" }), {
        status: 200,
      });
      fetchMock.mockResolvedValue(mockResponse);

      const { $fetch: customFetch } = createFetch({
        baseURL: "https://api.example.com",
      });

      await customFetch("https://other-api.example.com/users");

      expect(fetchMock).toHaveBeenCalledWith(
        "https://other-api.example.com/users",
        expect.any(Object),
      );
    });

    it("should resolve protocol-relative URLs with the base protocol", async () => {
      const mockResponse = new Response(JSON.stringify({ data: "test" }), {
        status: 200,
      });
      fetchMock.mockResolvedValue(mockResponse);

      const { $fetch: customFetch } = createFetch({
        baseURL: "https://api.example.com",
      });

      await customFetch("//other-api.example.com/users");

      expect(fetchMock).toHaveBeenCalledWith(
        "https://other-api.example.com/users",
        expect.any(Object),
      );
    });

    it("should work without baseURL", async () => {
      const mockResponse = new Response(JSON.stringify({ data: "test" }), {
        status: 200,
      });
      fetchMock.mockResolvedValue(mockResponse);

      const { $fetch: customFetch } = createFetch();

      await customFetch("https://api.example.com/users");

      expect(fetchMock).toHaveBeenCalledWith("https://api.example.com/users", expect.any(Object));
    });
  });

  describe("default headers", () => {
    it("should include default headers in all requests", async () => {
      const mockResponse = new Response(JSON.stringify({ data: "test" }), {
        status: 200,
      });
      fetchMock.mockResolvedValue(mockResponse);

      const { $fetch: customFetch } = createFetch({
        headers: {
          Authorization: "Bearer default-token",
          "X-API-Key": "api-key-123",
        },
      });

      await customFetch("https://api.example.com/users");

      const calledHeaders = fetchMock.mock.calls[0]?.[1]?.headers as Headers;
      expect(calledHeaders.get("Authorization")).toBe("Bearer default-token");
      expect(calledHeaders.get("X-API-Key")).toBe("api-key-123");
    });

    it("should allow request headers to override default headers", async () => {
      const mockResponse = new Response(JSON.stringify({ data: "test" }), {
        status: 200,
      });
      fetchMock.mockResolvedValue(mockResponse);

      const { $fetch: customFetch } = createFetch({
        headers: {
          Authorization: "Bearer default-token",
        },
      });

      await customFetch("https://api.example.com/users", {
        headers: {
          Authorization: "Bearer override-token",
        },
      });

      const calledHeaders = fetchMock.mock.calls[0]?.[1]?.headers as Headers;
      expect(calledHeaders.get("Authorization")).toBe("Bearer override-token");
    });

    it("should merge default and request headers", async () => {
      const mockResponse = new Response(JSON.stringify({ data: "test" }), {
        status: 200,
      });
      fetchMock.mockResolvedValue(mockResponse);

      const { $fetch: customFetch } = createFetch({
        headers: {
          Authorization: "Bearer default-token",
          "X-Default-Header": "default-value",
        },
      });

      await customFetch("https://api.example.com/users", {
        headers: {
          "X-Request-Header": "request-value",
        },
      });

      const calledHeaders = fetchMock.mock.calls[0]?.[1]?.headers as Headers;
      expect(calledHeaders.get("Authorization")).toBe("Bearer default-token");
      expect(calledHeaders.get("X-Default-Header")).toBe("default-value");
      expect(calledHeaders.get("X-Request-Header")).toBe("request-value");
    });
  });

  describe("default options", () => {
    it("should include default searchParams from factory options", async () => {
      const mockResponse = new Response(JSON.stringify({ data: "test" }), {
        status: 200,
      });
      fetchMock.mockResolvedValue(mockResponse);

      const { $fetch: customFetch } = createFetch({
        searchParams: {
          locale: "en",
          page: "2",
        },
      });

      await customFetch("https://api.example.com/users");

      expect(fetchMock).toHaveBeenCalledWith(
        "https://api.example.com/users?locale=en&page=2",
        expect.any(Object),
      );
    });

    it("should use throwOnFetchError default from factory options", async () => {
      const mockResponse = new Response(JSON.stringify({ error: "Not Found" }), {
        status: 404,
        statusText: "Not Found",
      });
      fetchMock.mockResolvedValue(mockResponse);

      const { $fetch: customFetch } = createFetch({
        throwOnFetchError: false,
      });

      const result = await customFetch("https://api.example.com/missing");

      expect(result).toBeInstanceOf(Response);
      expect(result.status).toBe(404);
    });

    it("should use throwOnValidationError default from factory options", async () => {
      const UserSchema = object({
        id: number(),
        name: string(),
      });
      const invalidData = { id: "not-a-number", name: 123 };
      const mockResponse = new Response(JSON.stringify(invalidData), {
        status: 200,
      });
      fetchMock.mockResolvedValue(mockResponse);

      const { $fetch: customFetch } = createFetch({
        throwOnValidationError: false,
      });

      const result = await customFetch("https://api.example.com/user", UserSchema);

      expect(result).toHaveProperty("issues");
    });

    it("should allow per-request override of throwOnFetchError", async () => {
      const mockResponse = new Response(JSON.stringify({ error: "Not Found" }), {
        status: 404,
        statusText: "Not Found",
      });
      fetchMock.mockResolvedValue(mockResponse);

      const { $fetch: customFetch } = createFetch({
        throwOnFetchError: false,
      });

      await expect(
        customFetch("https://api.example.com/missing", {
          throwOnFetchError: true,
        }),
      ).rejects.toThrow(FetchError);
    });

    it("should allow per-request override of throwOnValidationError", async () => {
      const UserSchema = object({
        id: number(),
        name: string(),
      });
      const invalidData = { id: "not-a-number", name: 123 };
      const mockResponse = new Response(JSON.stringify(invalidData), {
        status: 200,
      });
      fetchMock.mockResolvedValue(mockResponse);

      const { $fetch: customFetch } = createFetch({
        throwOnValidationError: false,
      });

      await expect(
        customFetch("https://api.example.com/user", UserSchema, {
          throwOnValidationError: true,
        }),
      ).rejects.toThrow(ValidationError);
    });
  });

  describe("custom $fetch behavior", () => {
    it("should behave like global $fetch with schema validation", async () => {
      const UserSchema = object({
        id: number(),
        name: string(),
      });
      const userData = { id: 1, name: "John" };
      const mockResponse = new Response(JSON.stringify(userData), {
        status: 200,
      });
      fetchMock.mockResolvedValue(mockResponse);

      const { $fetch: customFetch } = createFetch({
        baseURL: "https://api.example.com",
      });

      const result = await customFetch("/user", UserSchema);

      expect(result).toStrictEqual(userData);
    });

    it("should behave like global $fetch without schema", async () => {
      const mockResponse = new Response(JSON.stringify({ data: "test" }), {
        status: 200,
      });
      fetchMock.mockResolvedValue(mockResponse);

      const { $fetch: customFetch } = createFetch({
        baseURL: "https://api.example.com",
      });

      const result = await customFetch("/test");

      expect(result).toBeInstanceOf(Response);
      expect(result).toBe(mockResponse);
    });

    it("should apply factory defaults to all requests", async () => {
      const mockResponse = new Response(JSON.stringify({ data: "test" }), {
        status: 200,
      });
      fetchMock.mockResolvedValue(mockResponse);

      const { $fetch: customFetch } = createFetch({
        baseURL: "https://api.example.com",
        headers: {
          Authorization: "Bearer token",
        },
      });

      await customFetch("/users");
      await customFetch("/posts");

      expect(fetchMock).toHaveBeenCalledTimes(2);

      const firstCallHeaders = fetchMock.mock.calls[0]?.[1]?.headers as Headers;
      const secondCallHeaders = fetchMock.mock.calls[1]?.[1]?.headers as Headers;

      expect(firstCallHeaders.get("Authorization")).toBe("Bearer token");
      expect(secondCallHeaders.get("Authorization")).toBe("Bearer token");

      expect(fetchMock.mock.calls[0]?.[0]).toBe("https://api.example.com/users");
      expect(fetchMock.mock.calls[1]?.[0]).toBe("https://api.example.com/posts");
    });
  });

  describe("custom api methods", () => {
    it("should return api object with get, post, put, patch, delete methods", () => {
      const { api: customApi } = createFetch();

      expect(customApi).toMatchObject({
        delete: expect.any(Function),
        get: expect.any(Function),
        patch: expect.any(Function),
        post: expect.any(Function),
        put: expect.any(Function),
      });
    });

    it("should apply factory defaults to api method requests", async () => {
      const UserSchema = object({
        id: number(),
        name: string(),
      });
      const userData = { id: 1, name: "John" };
      const mockResponse = new Response(JSON.stringify(userData), {
        status: 200,
      });
      fetchMock.mockResolvedValue(mockResponse);

      const { api: customApi } = createFetch({
        baseURL: "https://api.example.com",
        headers: {
          Authorization: "Bearer token",
        },
      });

      const result = await customApi.get("/users/1", UserSchema);

      expect(result).toStrictEqual(userData);
      expect(fetchMock).toHaveBeenCalledWith(
        "https://api.example.com/users/1",
        expect.objectContaining({
          method: "GET",
        }),
      );

      const calledHeaders = fetchMock.mock.calls[0]?.[1]?.headers as Headers;
      expect(calledHeaders.get("Authorization")).toBe("Bearer token");
    });
  });
});

describe("api convenience methods", () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  const UserSchema = object({
    id: number(),
    name: string(),
  });

  beforeEach(() => {
    fetchMock = vi.fn<typeof fetch>();
    globalThis.fetch = fetchMock as typeof fetch;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("api.get", () => {
    it("should make a GET request", async () => {
      const userData = { id: 1, name: "John" };
      const mockResponse = new Response(JSON.stringify(userData), {
        status: 200,
      });
      fetchMock.mockResolvedValue(mockResponse);

      await api.get("https://api.example.com/users/1", UserSchema);

      expect(fetchMock).toHaveBeenCalledWith(
        "https://api.example.com/users/1",
        expect.objectContaining({ method: "GET" }),
      );
    });

    it("should validate response against schema", async () => {
      const userData = { id: 1, name: "John" };
      const mockResponse = new Response(JSON.stringify(userData), {
        status: 200,
      });
      fetchMock.mockResolvedValue(mockResponse);

      const result = await api.get("https://api.example.com/users/1", UserSchema);

      expect(result).toStrictEqual(userData);
    });

    it("should pass additional options to fetch", async () => {
      const userData = { id: 1, name: "John" };
      const mockResponse = new Response(JSON.stringify(userData), {
        status: 200,
      });
      fetchMock.mockResolvedValue(mockResponse);

      await api.get("https://api.example.com/users/1", UserSchema, {
        credentials: "include",
        headers: { Authorization: "Bearer token123" },
      });

      expect(fetchMock).toHaveBeenCalledWith(
        "https://api.example.com/users/1",
        expect.objectContaining({
          credentials: "include",
          method: "GET",
        }),
      );
      const calledHeaders = fetchMock.mock.calls[0]?.[1]?.headers as Headers;
      expect(calledHeaders.get("Authorization")).toBe("Bearer token123");
    });
  });

  describe("api.post", () => {
    it("should make a POST request", async () => {
      const userData = { id: 1, name: "John" };
      const mockResponse = new Response(JSON.stringify(userData), {
        status: 201,
      });
      fetchMock.mockResolvedValue(mockResponse);

      await api.post("https://api.example.com/users", UserSchema);

      expect(fetchMock).toHaveBeenCalledWith(
        "https://api.example.com/users",
        expect.objectContaining({ method: "POST" }),
      );
    });

    it("should validate response against schema", async () => {
      const userData = { id: 1, name: "John" };
      const mockResponse = new Response(JSON.stringify(userData), {
        status: 201,
      });
      fetchMock.mockResolvedValue(mockResponse);

      const result = await api.post("https://api.example.com/users", UserSchema);

      expect(result).toStrictEqual(userData);
    });

    it("should handle json request bodies", async () => {
      const userData = { id: 1, name: "John" };
      const mockResponse = new Response(JSON.stringify(userData), {
        status: 201,
      });
      fetchMock.mockResolvedValue(mockResponse);

      const bodyData = { name: "John" };
      await api.post("https://api.example.com/users", UserSchema, {
        json: bodyData,
      });

      const calledBody = fetchMock.mock.calls[0]?.[1]?.body;
      expect(calledBody).toBe(JSON.stringify(bodyData));
    });

    it("should pass additional options to fetch", async () => {
      const userData = { id: 1, name: "John" };
      const mockResponse = new Response(JSON.stringify(userData), {
        status: 201,
      });
      fetchMock.mockResolvedValue(mockResponse);

      await api.post("https://api.example.com/users", UserSchema, {
        credentials: "same-origin",
        headers: { "X-Custom-Header": "custom-value" },
      });

      expect(fetchMock).toHaveBeenCalledWith(
        "https://api.example.com/users",
        expect.objectContaining({
          credentials: "same-origin",
          method: "POST",
        }),
      );
      const calledHeaders = fetchMock.mock.calls[0]?.[1]?.headers as Headers;
      expect(calledHeaders.get("X-Custom-Header")).toBe("custom-value");
    });
  });

  describe("api.put", () => {
    it("should make a PUT request", async () => {
      const userData = { id: 1, name: "John Updated" };
      const mockResponse = new Response(JSON.stringify(userData), {
        status: 200,
      });
      fetchMock.mockResolvedValue(mockResponse);

      await api.put("https://api.example.com/users/1", UserSchema);

      expect(fetchMock).toHaveBeenCalledWith(
        "https://api.example.com/users/1",
        expect.objectContaining({ method: "PUT" }),
      );
    });

    it("should validate response against schema", async () => {
      const userData = { id: 1, name: "John Updated" };
      const mockResponse = new Response(JSON.stringify(userData), {
        status: 200,
      });
      fetchMock.mockResolvedValue(mockResponse);

      const result = await api.put("https://api.example.com/users/1", UserSchema);

      expect(result).toStrictEqual(userData);
    });

    it("should handle json request bodies", async () => {
      const userData = { id: 1, name: "John Updated" };
      const mockResponse = new Response(JSON.stringify(userData), {
        status: 200,
      });
      fetchMock.mockResolvedValue(mockResponse);

      const bodyData = { name: "John Updated" };
      await api.put("https://api.example.com/users/1", UserSchema, {
        json: bodyData,
      });

      const calledBody = fetchMock.mock.calls[0]?.[1]?.body;
      expect(calledBody).toBe(JSON.stringify(bodyData));
    });

    it("should pass additional options to fetch", async () => {
      const userData = { id: 1, name: "John Updated" };
      const mockResponse = new Response(JSON.stringify(userData), {
        status: 200,
      });
      fetchMock.mockResolvedValue(mockResponse);

      await api.put("https://api.example.com/users/1", UserSchema, {
        headers: { Authorization: "Bearer token" },
        mode: "cors",
      });

      expect(fetchMock).toHaveBeenCalledWith(
        "https://api.example.com/users/1",
        expect.objectContaining({
          method: "PUT",
          mode: "cors",
        }),
      );
      const calledHeaders = fetchMock.mock.calls[0]?.[1]?.headers as Headers;
      expect(calledHeaders.get("Authorization")).toBe("Bearer token");
    });
  });

  describe("api.patch", () => {
    it("should make a PATCH request", async () => {
      const userData = { id: 1, name: "John Patched" };
      const mockResponse = new Response(JSON.stringify(userData), {
        status: 200,
      });
      fetchMock.mockResolvedValue(mockResponse);

      await api.patch("https://api.example.com/users/1", UserSchema);

      expect(fetchMock).toHaveBeenCalledWith(
        "https://api.example.com/users/1",
        expect.objectContaining({ method: "PATCH" }),
      );
    });

    it("should validate response against schema", async () => {
      const userData = { id: 1, name: "John Patched" };
      const mockResponse = new Response(JSON.stringify(userData), {
        status: 200,
      });
      fetchMock.mockResolvedValue(mockResponse);

      const result = await api.patch("https://api.example.com/users/1", UserSchema);

      expect(result).toStrictEqual(userData);
    });

    it("should handle json request bodies", async () => {
      const userData = { id: 1, name: "John Patched" };
      const mockResponse = new Response(JSON.stringify(userData), {
        status: 200,
      });
      fetchMock.mockResolvedValue(mockResponse);

      const bodyData = { name: "John Patched" };
      await api.patch("https://api.example.com/users/1", UserSchema, {
        json: bodyData,
      });

      const calledBody = fetchMock.mock.calls[0]?.[1]?.body;
      expect(calledBody).toBe(JSON.stringify(bodyData));
    });

    it("should pass additional options to fetch", async () => {
      const userData = { id: 1, name: "John Patched" };
      const mockResponse = new Response(JSON.stringify(userData), {
        status: 200,
      });
      fetchMock.mockResolvedValue(mockResponse);

      await api.patch("https://api.example.com/users/1", UserSchema, {
        cache: "no-store",
        headers: { "X-Patch-Header": "patch-value" },
      });

      expect(fetchMock).toHaveBeenCalledWith(
        "https://api.example.com/users/1",
        expect.objectContaining({
          cache: "no-store",
          method: "PATCH",
        }),
      );
      const calledHeaders = fetchMock.mock.calls[0]?.[1]?.headers as Headers;
      expect(calledHeaders.get("X-Patch-Header")).toBe("patch-value");
    });
  });

  describe("api.delete", () => {
    it("should make a DELETE request", async () => {
      const userData = { id: 1, name: "John" };
      const mockResponse = new Response(JSON.stringify(userData), {
        status: 200,
      });
      fetchMock.mockResolvedValue(mockResponse);

      await api.delete("https://api.example.com/users/1", UserSchema);

      expect(fetchMock).toHaveBeenCalledWith(
        "https://api.example.com/users/1",
        expect.objectContaining({ method: "DELETE" }),
      );
    });

    it("should validate response against schema", async () => {
      const userData = { id: 1, name: "John" };
      const mockResponse = new Response(JSON.stringify(userData), {
        status: 200,
      });
      fetchMock.mockResolvedValue(mockResponse);

      const result = await api.delete("https://api.example.com/users/1", UserSchema);

      expect(result).toStrictEqual(userData);
    });

    it("should pass additional options to fetch", async () => {
      const userData = { id: 1, name: "John" };
      const mockResponse = new Response(JSON.stringify(userData), {
        status: 200,
      });
      fetchMock.mockResolvedValue(mockResponse);

      await api.delete("https://api.example.com/users/1", UserSchema, {
        credentials: "include",
        headers: { Authorization: "Bearer token" },
      });

      expect(fetchMock).toHaveBeenCalledWith(
        "https://api.example.com/users/1",
        expect.objectContaining({
          credentials: "include",
          method: "DELETE",
        }),
      );
      const calledHeaders = fetchMock.mock.calls[0]?.[1]?.headers as Headers;
      expect(calledHeaders.get("Authorization")).toBe("Bearer token");
    });
  });

  describe("shared behavior", () => {
    it("should always require a schema parameter", async () => {
      const userData = { id: 1, name: "John" };
      const mockResponse = new Response(JSON.stringify(userData), {
        status: 200,
      });
      fetchMock.mockResolvedValue(mockResponse);

      // All api methods require a schema - testing with TypeScript compile-time check
      // The schema is always the second parameter
      const result = await api.get("https://api.example.com/users/1", UserSchema);

      expect(result).toStrictEqual(userData);
    });

    it("should throw ValidationError on validation failure (default)", async () => {
      const invalidData = { id: "not-a-number", name: 123 };
      const mockResponse = new Response(JSON.stringify(invalidData), {
        status: 200,
      });
      fetchMock.mockResolvedValue(mockResponse);

      await expect(api.get("https://api.example.com/users/1", UserSchema)).rejects.toThrow(
        ValidationError,
      );
    });

    it("should throw FetchError on non-ok response (default)", async () => {
      const mockResponse = new Response(JSON.stringify({ error: "Not Found" }), {
        status: 404,
        statusText: "Not Found",
      });
      fetchMock.mockResolvedValue(mockResponse);

      await expect(api.get("https://api.example.com/users/999", UserSchema)).rejects.toThrow(
        FetchError,
      );
    });

    it("should respect throwOnValidationError option", async () => {
      const invalidData = { id: "not-a-number", name: 123 };
      const mockResponse = new Response(JSON.stringify(invalidData), {
        status: 200,
      });
      fetchMock.mockResolvedValue(mockResponse);

      const result = await api.get("https://api.example.com/users/1", UserSchema, {
        throwOnValidationError: false,
      });

      expect(result).toHaveProperty("issues");
      expect(Array.isArray((result as { issues: unknown[] }).issues)).toBeTruthy();
    });

    it("should respect throwOnFetchError option", async () => {
      const mockResponse = new Response(JSON.stringify({ error: "Not Found" }), {
        status: 404,
        statusText: "Not Found",
      });
      fetchMock.mockResolvedValue(mockResponse);

      const result = await api.get("https://api.example.com/users/999", UserSchema, {
        throwOnFetchError: false,
        throwOnValidationError: false,
      });

      expect(result).toHaveProperty("issues");
    });
  });
});

describe("global fetch defaults", () => {
  it("uses fetch-compatible defaults", () => {
    expect(GLOBAL_DEFAULTS).toStrictEqual({
      baseURL: "",
      throwOnFetchError: true,
      throwOnValidationError: true,
    });
  });
});

describe("request input normalization", () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn<typeof fetch>();
    globalThis.fetch = fetchMock as typeof fetch;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("accepts URL instances as input", async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ ok: true })));

    await $fetch(new URL("/users", "https://api.example.com"));

    expect(fetchMock).toHaveBeenCalledWith("https://api.example.com/users", expect.any(Object));
  });

  it("accepts a Request input with no options", async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ ok: true })));
    const request = new Request("https://api.example.com/users", {
      headers: { A: "1" },
      method: "POST",
    });

    await $fetch(request);

    const [sentRequest] = fetchMock.mock.calls[0] as [Request, RequestInit];
    expect(sentRequest).toBeInstanceOf(Request);
    expect(sentRequest.url).toBe("https://api.example.com/users");
  });

  it("clones Request inputs, merges headers, and lets request-level options win", async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ ok: true })));
    const request = new Request("https://api.example.com/users", {
      headers: { A: "1", B: "2" },
      method: "POST",
    });

    await $fetch(request, { headers: { B: "20", C: "3" }, method: "PATCH" });

    const [sentRequest, init] = fetchMock.mock.calls[0] as [Request, RequestInit];
    const headers = new Headers(init.headers);

    expect(sentRequest).toBeInstanceOf(Request);
    expect(sentRequest).not.toBe(request);
    expect(sentRequest.url).toBe("https://api.example.com/users");
    expect(init.method).toBe("PATCH");
    expect(headers.get("A")).toBe("1");
    expect(headers.get("B")).toBe("20");
    expect(headers.get("C")).toBe("3");
  });
});

describe("json and body conflicts", () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn<typeof fetch>();
    globalThis.fetch = fetchMock as typeof fetch;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("throws when json and body are both provided", async () => {
    // @ts-expect-error body and json are intentionally both provided to test the runtime guard.
    const options = { body: "raw", json: { name: "Zap" }, method: "POST" };

    await expect($fetch("https://api.example.com/users", options)).rejects.toThrow(TypeError);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("sets Content-Type when default headers exist without one", async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ ok: true })));
    const { $fetch: customFetch } = createFetch({
      headers: { Authorization: "Bearer token" },
    });

    await customFetch("https://api.example.com/users", {
      json: { name: "Zap" },
      method: "POST",
    });

    const init = fetchMock.mock.calls[0]?.[1] as RequestInit;
    const headers = new Headers(init.headers);
    expect(headers.get("Authorization")).toBe("Bearer token");
    expect(headers.get("Content-Type")).toBe("application/json");
  });
});

describe("URL and search param resolution", () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn<typeof fetch>();
    globalThis.fetch = fetchMock as typeof fetch;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("merges default, URL, and request search params in that order", async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ ok: true })));
    const { $fetch: customFetch } = createFetch({
      baseURL: "https://api.example.com",
      searchParams: { locale: "en", page: "1" },
    });

    await customFetch("users?page=2&from=resource#team", {
      searchParams: { page: "3", q: "zap" },
    });

    expect(fetchMock.mock.calls[0]?.[0]).toBe(
      "https://api.example.com/users?locale=en&page=3&from=resource&q=zap#team",
    );
  });

  it("accepts native URLSearchParams constructor input", async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ ok: true })));

    await $fetch("https://api.example.com/users", {
      searchParams: new URLSearchParams({ q: "test" }),
    });

    expect(fetchMock.mock.calls[0]?.[0]).toBe("https://api.example.com/users?q=test");
  });

  it("does not add a query string for empty search params", async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ ok: true })));

    await $fetch("https://api.example.com/users#team", { searchParams: {} });

    expect(fetchMock.mock.calls[0]?.[0]).toBe("https://api.example.com/users#team");
  });

  it("preserves an explicit empty fragment when adding search params", async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ ok: true })));

    await $fetch("https://api.example.com/users#", {
      searchParams: { q: "zap" },
    });

    expect(fetchMock.mock.calls[0]?.[0]).toBe("https://api.example.com/users?q=zap#");
  });

  it("merges search params before a fragment when the path already has a query", async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ ok: true })));
    const { $fetch: customFetch } = createFetch({
      baseURL: "https://api.example.com/",
    });

    await customFetch("items?sort=name#results", {
      searchParams: { page: "2" },
    });

    expect(fetchMock.mock.calls[0]?.[0]).toBe(
      "https://api.example.com/items?sort=name&page=2#results",
    );
  });
});

describe("method helper", () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  const UserSchema = object({
    id: number(),
    name: string(),
  });

  beforeEach(() => {
    fetchMock = vi.fn<typeof fetch>();
    globalThis.fetch = fetchMock as typeof fetch;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("supports raw Response calls without a schema", async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ ok: true })));

    const result = await api.delete("https://api.example.com/users/1", {
      headers: { A: "1" },
    });

    expect(result).toBeInstanceOf(Response);
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.example.com/users/1",
      expect.objectContaining({ method: "DELETE" }),
    );
  });

  it("preserves throwOnValidationError: true when explicitly provided", async () => {
    const invalidData = { id: "not-a-number", name: 123 };
    fetchMock.mockResolvedValue(new Response(JSON.stringify(invalidData)));

    await expect(
      api.put("https://api.example.com/users/1", UserSchema, {
        throwOnValidationError: true,
      }),
    ).rejects.toThrow(ValidationError);
  });

  it("lets the helper method win when runtime options contain a method", async () => {
    const userData = { id: 1, name: "John" };
    fetchMock.mockResolvedValue(new Response(JSON.stringify(userData)));

    await api.patch("https://api.example.com/users/1", UserSchema, {
      method: "POST",
    } as never);

    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.example.com/users/1",
      expect.objectContaining({ method: "PATCH" }),
    );
  });
});

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

    const [sentRequest, init] = fetchMock.mock.calls[0] as [Request, RequestInit];
    const headers = new Headers(init.headers);

    expect(sentRequest).toBeInstanceOf(Request);
    expect(sentRequest).not.toBe(request);
    expect(sentRequest.url).toBe("https://api.example.com/users");
    expect(init.method).toBe("PATCH");
    expect([headers.get("A"), headers.get("B"), headers.get("C")]).toStrictEqual(["1", "20", "3"]);
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
    expect(fetchMock.mock.calls[0]?.[0]).toBe("https://api.example.com/users?q=zap#team");

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
      }),
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
      },
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
      "application/vnd.api+json",
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

describe("ArkType Standard Schema compatibility", () => {
  it("should expose ~standard property", () => {
    const schema = type({ id: "number" });
    expect("~standard" in schema).toBeTruthy();
    expect(schema["~standard"]).toBeDefined();
  });

  it("should be recognized by isStandardSchema", () => {
    const schema = type({ id: "number" });
    expect(isStandardSchema(schema)).toBeTruthy();
  });
});

describe("$fetch with ArkType schemas", () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn<typeof fetch>();
    globalThis.fetch = fetchMock as typeof fetch;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should validate with ArkType object schema", async () => {
    const schema = type({
      email: "string.email",
      id: "number",
      name: "string",
    });

    const mockData = { email: "test@example.com", id: 1, name: "Test User" };

    fetchMock.mockResolvedValue({
      headers: new Headers({ "content-type": "application/json" }),
      json: () => mockData,
      ok: true,
      status: 200,
      statusText: "OK",
    });

    const result = await $fetch("https://api.example.com/user", schema);

    expect(result).toStrictEqual(mockData);
  });

  it("should throw ValidationError on invalid data with ArkType", async () => {
    const schema = type({
      email: "string.email",
      id: "number",
    });

    const invalidData = { email: "not-an-email", id: 1 };

    fetchMock.mockResolvedValue({
      headers: new Headers({ "content-type": "application/json" }),
      json: () => invalidData,
      ok: true,
      status: 200,
      statusText: "OK",
    });

    await expect($fetch("https://api.example.com/user", schema)).rejects.toThrow(ValidationError);
  });

  it("should return validation result when throwOnValidationError is false with ArkType", async () => {
    const schema = type({
      email: "string.email",
      id: "number",
    });

    const invalidData = { email: "not-an-email", id: 1 };

    fetchMock.mockResolvedValue({
      headers: new Headers({ "content-type": "application/json" }),
      json: () => invalidData,
      ok: true,
      status: 200,
      statusText: "OK",
    });

    const result = await $fetch("https://api.example.com/user", schema, {
      throwOnValidationError: false,
    });

    expect(result).toHaveProperty("issues");
    expect(Array.isArray((result as { issues?: unknown }).issues)).toBeTruthy();
  });

  it("should return successful validation result when data is valid and throwOnValidationError is false", async () => {
    const schema = type({
      email: "string.email",
      id: "number",
    });

    const validData = { email: "test@example.com", id: 1 };

    fetchMock.mockResolvedValue({
      headers: new Headers({ "content-type": "application/json" }),
      json: () => validData,
      ok: true,
      status: 200,
      statusText: "OK",
    });

    const result = await $fetch("https://api.example.com/user", schema, {
      throwOnValidationError: false,
    });

    expect(result).toHaveProperty("value");
    expect((result as { value?: unknown }).value).toStrictEqual(validData);
    expect((result as { issues?: unknown }).issues).toBeUndefined();
  });

  it("should work with ArkType array schemas", async () => {
    const schema = type({
      id: "number",
      name: "string",
    }).array();

    const mockData = [
      { id: 1, name: "User 1" },
      { id: 2, name: "User 2" },
    ];

    fetchMock.mockResolvedValue({
      headers: new Headers({ "content-type": "application/json" }),
      json: () => mockData,
      ok: true,
      status: 200,
      statusText: "OK",
    });

    const result = await $fetch("https://api.example.com/users", schema);

    expect(result).toStrictEqual(mockData);
  });

  it("should work with api.get using ArkType", async () => {
    const schema = type({ success: "boolean" });
    const mockData = { success: true };

    fetchMock.mockResolvedValue({
      headers: new Headers({ "content-type": "application/json" }),
      json: () => mockData,
      ok: true,
      status: 200,
      statusText: "OK",
    });

    const result = await api.get("https://api.example.com/status", schema);

    expect(result).toStrictEqual(mockData);
  });

  it("should work with api.post using ArkType", async () => {
    const schema = type({ created: "boolean", id: "number" });
    const mockData = { created: true, id: 123 };
    const body = { name: "New Item" };

    fetchMock.mockResolvedValue({
      headers: new Headers({ "content-type": "application/json" }),
      json: () => mockData,
      ok: true,
      status: 201,
      statusText: "Created",
    });

    const result = await api.post("https://api.example.com/items", schema, {
      body: JSON.stringify(body),
    });

    expect(result).toStrictEqual(mockData);
  });

  it("should work with ArkType optional fields", async () => {
    const schema = type({
      "description?": "string",
      id: "number",
      name: "string",
    });

    const mockData = { id: 1, name: "Product" };

    fetchMock.mockResolvedValue({
      headers: new Headers({ "content-type": "application/json" }),
      json: () => mockData,
      ok: true,
      status: 200,
      statusText: "OK",
    });

    const result = await $fetch("https://api.example.com/product", schema);

    expect(result).toStrictEqual(mockData);
  });

  it("should work with ArkType union types", async () => {
    const schema = type("string|number");
    const mockData = "test-string";

    fetchMock.mockResolvedValue({
      headers: new Headers({ "content-type": "application/json" }),
      json: () => mockData,
      ok: true,
      status: 200,
      statusText: "OK",
    });

    const result = await $fetch("https://api.example.com/value", schema);

    expect(result).toBe(mockData);
  });
});

describe("Valibot Standard Schema compatibility", () => {
  it("should expose ~standard property", () => {
    const schema = v.object({ id: v.number() });
    expect("~standard" in schema).toBeTruthy();
    expect(schema["~standard"]).toBeDefined();
  });

  it("should be recognized by isStandardSchema", () => {
    const schema = v.object({ id: v.number() });
    expect(isStandardSchema(schema)).toBeTruthy();
  });
});

describe("$fetch with Valibot schemas", () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn<typeof fetch>();
    globalThis.fetch = fetchMock as typeof fetch;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should validate with Valibot object schema", async () => {
    const schema = v.object({
      email: v.pipe(v.string(), v.email()),
      id: v.number(),
      name: v.string(),
    });

    const mockData = { email: "test@example.com", id: 1, name: "Test User" };

    fetchMock.mockResolvedValue({
      headers: new Headers({ "content-type": "application/json" }),
      json: () => mockData,
      ok: true,
      status: 200,
      statusText: "OK",
    });

    const result = await $fetch("https://api.example.com/user", schema);

    expect(result).toStrictEqual(mockData);
  });

  it("should throw ValidationError on invalid data with Valibot", async () => {
    const schema = v.object({
      email: v.pipe(v.string(), v.email()),
      id: v.number(),
    });

    const invalidData = { email: "not-an-email", id: 1 };

    fetchMock.mockResolvedValue({
      headers: new Headers({ "content-type": "application/json" }),
      json: () => invalidData,
      ok: true,
      status: 200,
      statusText: "OK",
    });

    await expect($fetch("https://api.example.com/user", schema)).rejects.toThrow(ValidationError);
  });

  it("should return validation result when throwOnValidationError is false with Valibot", async () => {
    const schema = v.object({
      email: v.pipe(v.string(), v.email()),
      id: v.number(),
    });

    const invalidData = { email: "not-an-email", id: 1 };

    fetchMock.mockResolvedValue({
      headers: new Headers({ "content-type": "application/json" }),
      json: () => invalidData,
      ok: true,
      status: 200,
      statusText: "OK",
    });

    const result = await $fetch("https://api.example.com/user", schema, {
      throwOnValidationError: false,
    });

    expect(result).toHaveProperty("issues");
    expect(Array.isArray((result as { issues?: unknown }).issues)).toBeTruthy();
  });

  it("should return successful validation result when data is valid and throwOnValidationError is false", async () => {
    const schema = v.object({
      email: v.pipe(v.string(), v.email()),
      id: v.number(),
    });

    const validData = { email: "test@example.com", id: 1 };

    fetchMock.mockResolvedValue({
      headers: new Headers({ "content-type": "application/json" }),
      json: () => validData,
      ok: true,
      status: 200,
      statusText: "OK",
    });

    const result = await $fetch("https://api.example.com/user", schema, {
      throwOnValidationError: false,
    });

    expect(result).toHaveProperty("value");
    expect((result as { value?: unknown }).value).toStrictEqual(validData);
    expect((result as { issues?: unknown }).issues).toBeUndefined();
  });

  it("should work with Valibot array schemas", async () => {
    const schema = v.array(
      v.object({
        id: v.number(),
        name: v.string(),
      }),
    );

    const mockData = [
      { id: 1, name: "User 1" },
      { id: 2, name: "User 2" },
    ];

    fetchMock.mockResolvedValue({
      headers: new Headers({ "content-type": "application/json" }),
      json: () => mockData,
      ok: true,
      status: 200,
      statusText: "OK",
    });

    const result = await $fetch("https://api.example.com/users", schema);

    expect(result).toStrictEqual(mockData);
  });

  it("should work with api.get using Valibot", async () => {
    const schema = v.object({ success: v.boolean() });
    const mockData = { success: true };

    fetchMock.mockResolvedValue({
      headers: new Headers({ "content-type": "application/json" }),
      json: () => mockData,
      ok: true,
      status: 200,
      statusText: "OK",
    });

    const result = await api.get("https://api.example.com/status", schema);

    expect(result).toStrictEqual(mockData);
  });

  it("should work with api.post using Valibot", async () => {
    const schema = v.object({ created: v.boolean(), id: v.number() });
    const mockData = { created: true, id: 123 };
    const body = { name: "New Item" };

    fetchMock.mockResolvedValue({
      headers: new Headers({ "content-type": "application/json" }),
      json: () => mockData,
      ok: true,
      status: 201,
      statusText: "Created",
    });

    const result = await api.post("https://api.example.com/items", schema, {
      body: JSON.stringify(body),
    });

    expect(result).toStrictEqual(mockData);
  });

  it("should work with Valibot optional fields", async () => {
    const schema = v.object({
      description: v.optional(v.string()),
      id: v.number(),
      name: v.string(),
    });

    const mockData = { id: 1, name: "Product" };

    fetchMock.mockResolvedValue({
      headers: new Headers({ "content-type": "application/json" }),
      json: () => mockData,
      ok: true,
      status: 200,
      statusText: "OK",
    });

    const result = await $fetch("https://api.example.com/product", schema);

    expect(result).toStrictEqual(mockData);
  });
});

describe("Zod Standard Schema compatibility", () => {
  it("should expose ~standard property", () => {
    const schema = z.object({ id: z.number() });
    expect("~standard" in schema).toBeTruthy();
    expect(schema["~standard"]).toBeDefined();
  });

  it("should be recognized by isStandardSchema", () => {
    const schema = z.object({ id: z.number() });
    expect(isStandardSchema(schema)).toBeTruthy();
  });
});

describe("$fetch with Zod schemas", () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn<typeof fetch>();
    globalThis.fetch = fetchMock as typeof fetch;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should validate with Zod object schema", async () => {
    const schema = z.object({
      email: z.email(),
      id: z.number(),
      name: z.string(),
    });

    const mockData = { email: "test@example.com", id: 1, name: "Test User" };

    fetchMock.mockResolvedValue({
      headers: new Headers({ "content-type": "application/json" }),
      json: () => mockData,
      ok: true,
      status: 200,
      statusText: "OK",
    });

    const result = await $fetch("https://api.example.com/user", schema);

    expect(result).toStrictEqual(mockData);
  });

  it("should throw ValidationError on invalid data with Zod", async () => {
    const schema = z.object({
      email: z.email(),
      id: z.number(),
    });

    const invalidData = { email: "not-an-email", id: 1 };

    fetchMock.mockResolvedValue({
      headers: new Headers({ "content-type": "application/json" }),
      json: () => invalidData,
      ok: true,
      status: 200,
      statusText: "OK",
    });

    await expect($fetch("https://api.example.com/user", schema)).rejects.toThrow(ValidationError);
  });

  it("should return validation result when throwOnValidationError is false with Zod", async () => {
    const schema = z.object({
      email: z.email(),
      id: z.number(),
    });

    const invalidData = { email: "not-an-email", id: 1 };

    fetchMock.mockResolvedValue({
      headers: new Headers({ "content-type": "application/json" }),
      json: () => invalidData,
      ok: true,
      status: 200,
      statusText: "OK",
    });

    const result = await $fetch("https://api.example.com/user", schema, {
      throwOnValidationError: false,
    });

    expect(result).toHaveProperty("issues");
    expect(Array.isArray((result as { issues?: unknown }).issues)).toBeTruthy();
  });

  it("should return successful validation result when data is valid and throwOnValidationError is false", async () => {
    const schema = z.object({
      email: z.email(),
      id: z.number(),
    });

    const validData = { email: "test@example.com", id: 1 };

    fetchMock.mockResolvedValue({
      headers: new Headers({ "content-type": "application/json" }),
      json: () => validData,
      ok: true,
      status: 200,
      statusText: "OK",
    });

    const result = await $fetch("https://api.example.com/user", schema, {
      throwOnValidationError: false,
    });

    expect(result).toHaveProperty("value");
    expect((result as { value?: unknown }).value).toStrictEqual(validData);
    expect((result as { issues?: unknown }).issues).toBeUndefined();
  });

  it("should work with Zod array schemas", async () => {
    const schema = z.array(
      z.object({
        id: z.number(),
        name: z.string(),
      }),
    );

    const mockData = [
      { id: 1, name: "User 1" },
      { id: 2, name: "User 2" },
    ];

    fetchMock.mockResolvedValue({
      headers: new Headers({ "content-type": "application/json" }),
      json: () => mockData,
      ok: true,
      status: 200,
      statusText: "OK",
    });

    const result = await $fetch("https://api.example.com/users", schema);

    expect(result).toStrictEqual(mockData);
  });

  it("should work with api.get using Zod", async () => {
    const schema = z.object({ success: z.boolean() });
    const mockData = { success: true };

    fetchMock.mockResolvedValue({
      headers: new Headers({ "content-type": "application/json" }),
      json: () => mockData,
      ok: true,
      status: 200,
      statusText: "OK",
    });

    const result = await api.get("https://api.example.com/status", schema);

    expect(result).toStrictEqual(mockData);
  });

  it("should work with api.post using Zod", async () => {
    const schema = z.object({ created: z.boolean(), id: z.number() });
    const mockData = { created: true, id: 123 };
    const body = { name: "New Item" };

    fetchMock.mockResolvedValue({
      headers: new Headers({ "content-type": "application/json" }),
      json: () => mockData,
      ok: true,
      status: 201,
      statusText: "Created",
    });

    const result = await api.post("https://api.example.com/items", schema, {
      body: JSON.stringify(body),
    });

    expect(result).toStrictEqual(mockData);
  });
});

describe("logging", () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn<typeof fetch>();
    globalThis.fetch = fetchMock as typeof fetch;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("logs the outgoing request and a debug response on success", async () => {
    const logger = createRecordingLogger();
    const { $fetch: instanceFetch } = createFetch({ logger });
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 }));

    await instanceFetch("https://api.example.com/users", { method: "POST" });

    expect(logger.calls).toStrictEqual([
      {
        context: { method: "POST", url: "https://api.example.com/users" },
        level: "debug",
        message: "fetch request",
      },
      {
        context: {
          method: "POST",
          status: 200,
          url: "https://api.example.com/users",
        },
        level: "debug",
        message: "fetch response",
      },
    ]);
  });

  it("logs a warn response for non-2xx status", async () => {
    const logger = createRecordingLogger();
    const { $fetch: instanceFetch } = createFetch({
      logger,
      throwOnFetchError: false,
    });
    fetchMock.mockResolvedValue(
      new Response(null, { status: 500, statusText: "Internal Server Error" }),
    );

    await instanceFetch("https://api.example.com/users");

    expect(logger.calls).toStrictEqual([
      {
        context: { method: "GET", url: "https://api.example.com/users" },
        level: "debug",
        message: "fetch request",
      },
      {
        context: {
          method: "GET",
          status: 500,
          url: "https://api.example.com/users",
        },
        level: "warn",
        message: "fetch response",
      },
    ]);
  });

  it("logs a validation failure at error when throwOnValidationError is true", async () => {
    const logger = createRecordingLogger();
    const { $fetch: instanceFetch } = createFetch({ logger });
    const schema = z.object({ id: z.number() });
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ id: "not-a-number" }), { status: 200 }),
    );

    await expect(instanceFetch("https://api.example.com/users/1", schema)).rejects.toBeInstanceOf(
      ValidationError,
    );

    const errorCall = logger.calls.find((call) => call.level === "error");
    expect(errorCall?.message).toBe("fetch validation failed");
    expect(errorCall?.context?.url).toBe("https://api.example.com/users/1");
  });

  it("logs a validation failure at error when throwOnValidationError is false", async () => {
    const logger = createRecordingLogger();
    const { $fetch: instanceFetch } = createFetch({ logger });
    const schema = z.object({ id: z.number() });
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ id: "not-a-number" }), { status: 200 }),
    );

    const result = await instanceFetch("https://api.example.com/users/1", schema, {
      throwOnValidationError: false,
    });

    expect(result.issues).toBeDefined();
    const errorCall = logger.calls.find((call) => call.level === "error");
    expect(errorCall?.message).toBe("fetch validation failed");
  });

  it("does not log anything when no logger is provided", async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ ok: true })));

    await expect($fetch("https://api.example.com/users")).resolves.toBeInstanceOf(Response);
  });
});

describe($fetchResult, () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  const UserSchema = object({
    id: number(),
    name: string(),
  });

  beforeEach(() => {
    fetchMock = vi.fn<typeof fetch>();
    globalThis.fetch = fetchMock as typeof fetch;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("resolves to an Ok result with the raw Response when no schema is provided", async () => {
    const mockResponse = new Response(JSON.stringify({ data: "test" }), { status: 200 });
    fetchMock.mockResolvedValue(mockResponse);

    const result = await $fetchResult("https://api.example.com/test");

    expect(isOk(result)).toBeTruthy();
    if (isOk(result)) {
      expect(result.value).toBe(mockResponse);
    }
  });

  it("resolves to an Err result wrapping a FetchError on a non-ok response", async () => {
    const mockResponse = new Response(JSON.stringify({ error: "Not Found" }), {
      status: 404,
      statusText: "Not Found",
    });
    fetchMock.mockResolvedValue(mockResponse);

    const result = await $fetchResult("https://api.example.com/missing");

    expect(isErr(result)).toBeTruthy();
    if (isErr(result)) {
      expect(result.error).toBeInstanceOf(FetchError);
      expect(result.error.status).toBe(404);
    }
  });

  it("resolves to an Ok result with the validated value when a schema is provided", async () => {
    const userData = { id: 1, name: "John" };
    fetchMock.mockResolvedValue(new Response(JSON.stringify(userData), { status: 200 }));

    const result = await $fetchResult("https://api.example.com/user", UserSchema);

    expect(result).toStrictEqual({ ok: true, value: userData });
  });

  it("resolves to an Err result wrapping a ValidationError when validation fails", async () => {
    const invalidData = { id: "not-a-number", name: 123 };
    fetchMock.mockResolvedValue(new Response(JSON.stringify(invalidData), { status: 200 }));

    const result = await $fetchResult("https://api.example.com/user", UserSchema);

    expect(isErr(result)).toBeTruthy();
    if (isErr(result)) {
      expect(result.error).toBeInstanceOf(ValidationError);
    }
  });

  it("resolves to an Err result wrapping a FetchError before validating, on a non-ok response with a schema", async () => {
    const mockResponse = new Response(JSON.stringify({}), { status: 500 });
    fetchMock.mockResolvedValue(mockResponse);
    const jsonSpy = vi.spyOn(mockResponse, "json");

    const result = await $fetchResult("https://api.example.com/user", UserSchema);

    expect(isErr(result)).toBeTruthy();
    if (isErr(result)) {
      expect(result.error).toBeInstanceOf(FetchError);
    }
    expect(jsonSpy).not.toHaveBeenCalled();
  });

  it("propagates a programmer error (e.g. conflicting body/json options) instead of wrapping it", async () => {
    await expect(
      $fetchResult("https://api.example.com/test", {
        body: "raw",
        // @ts-expect-error -- deliberately conflicting with `body` to trigger the TypeError.
        json: { a: 1 },
      }),
    ).rejects.toThrow("Cannot provide both `body` and `json`.");
  });

  it("supports chaining before awaiting, like other ResultAsync values", async () => {
    const mockResponse = new Response(JSON.stringify({ data: "test" }), { status: 200 });
    fetchMock.mockResolvedValue(mockResponse);

    const status = await $fetchResult("https://api.example.com/test").map(
      (response) => response.status,
    );

    expect(status).toStrictEqual({ ok: true, value: 200 });
  });
});

describe("apiResult convenience methods", () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  const UserSchema = object({
    id: number(),
    name: string(),
  });

  beforeEach(() => {
    fetchMock = vi.fn<typeof fetch>();
    globalThis.fetch = fetchMock as typeof fetch;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("apiResult.get makes a GET request and resolves to Ok with the validated value", async () => {
    const userData = { id: 1, name: "John" };
    fetchMock.mockResolvedValue(new Response(JSON.stringify(userData), { status: 200 }));

    const result = await apiResult.get("https://api.example.com/users/1", UserSchema);

    expect(result).toStrictEqual({ ok: true, value: userData });
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.example.com/users/1",
      expect.objectContaining({ method: "GET" }),
    );
  });

  it("apiResult.post makes a POST request and resolves to an Err result on failure", async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify({}), { status: 500 }));

    const result = await apiResult.post("https://api.example.com/users", UserSchema);

    expect(isErr(result)).toBeTruthy();
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.example.com/users",
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("apiResult.delete makes a DELETE request without a schema and resolves to Ok with the raw Response", async () => {
    const mockResponse = new Response(null, { status: 204 });
    fetchMock.mockResolvedValue(mockResponse);

    const result = await apiResult.delete("https://api.example.com/users/1");

    expect(result).toStrictEqual({ ok: true, value: mockResponse });
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.example.com/users/1",
      expect.objectContaining({ method: "DELETE" }),
    );
  });
});

describe("createFetch Result-returning variant", () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn<typeof fetch>();
    globalThis.fetch = fetchMock as typeof fetch;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns an instance with $fetchResult and apiResult properties", () => {
    const instance = createFetch();

    expect(instance).toHaveProperty("$fetchResult");
    expect(instance).toHaveProperty("apiResult");
    expect(instance.$fetchResult).toBeTypeOf("function");
    expect(instance.apiResult).toBeTypeOf("object");
  });

  it("$fetchResult respects the instance's baseURL", async () => {
    const mockResponse = new Response(JSON.stringify({ data: "test" }), { status: 200 });
    fetchMock.mockResolvedValue(mockResponse);
    const { $fetchResult: instanceFetchResult } = createFetch({
      baseURL: "https://api.example.com",
    });

    const result = await instanceFetchResult("/endpoint");

    expect(result).toStrictEqual({ ok: true, value: mockResponse });
    expect(fetchMock).toHaveBeenCalledWith("https://api.example.com/endpoint", expect.any(Object));
  });

  it("$fetchResult validates against a schema when one is provided", async () => {
    const userData = { id: 1, name: "John" };
    fetchMock.mockResolvedValue(new Response(JSON.stringify(userData), { status: 200 }));
    const { $fetchResult: instanceFetchResult } = createFetch({
      baseURL: "https://api.example.com",
    });
    const UserSchema = object({ id: number(), name: string() });

    const result = await instanceFetchResult("/users/1", UserSchema);

    expect(result).toStrictEqual({ ok: true, value: userData });
  });
});
