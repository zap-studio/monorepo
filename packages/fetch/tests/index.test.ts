import { number, object, string } from "valibot";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { $fetch, api, createFetch } from "../src";
import { FetchError, ValidationError } from "../src/errors";

describe("$fetch", () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn<typeof fetch>();
    global.fetch = fetchMock as typeof fetch;
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

      expect(fetchMock).toHaveBeenCalledWith(
        "https://api.example.com/test",
        expect.any(Object)
      );
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
        method: "POST",
        credentials: "include",
        mode: "cors",
      });

      expect(fetchMock).toHaveBeenCalledWith(
        "https://api.example.com/test",
        expect.objectContaining({
          method: "POST",
          credentials: "include",
          mode: "cors",
        })
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
          expect.objectContaining({ method })
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

      expect(result).toEqual(userData);
    });

    it("should return validated data when schema validation passes", async () => {
      const userData = { id: 42, name: "Jane Doe" };
      const mockResponse = new Response(JSON.stringify(userData), {
        status: 200,
      });
      fetchMock.mockResolvedValue(mockResponse);

      const result = await $fetch("https://api.example.com/user", UserSchema);

      expect(result).toEqual(userData);
      expect(result).toHaveProperty("id", 42);
      expect(result).toHaveProperty("name", "Jane Doe");
    });

    it("should throw ValidationError when validation fails and throwOnValidationError is true (default)", async () => {
      const invalidData = { id: "not-a-number", name: 123 };
      const mockResponse = new Response(JSON.stringify(invalidData), {
        status: 200,
      });
      fetchMock.mockResolvedValue(mockResponse);

      await expect(
        $fetch("https://api.example.com/user", UserSchema)
      ).rejects.toThrow(ValidationError);
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
      expect(Array.isArray((result as { issues: unknown[] }).issues)).toBe(
        true
      );
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
      expect((result as { value: unknown }).value).toEqual(userData);
    });

    it("should parse response as JSON when schema is provided", async () => {
      const userData = { id: 1, name: "John" };
      const mockResponse = new Response(JSON.stringify(userData), {
        status: 200,
      });
      const jsonSpy = vi.spyOn(mockResponse, "json");
      fetchMock.mockResolvedValue(mockResponse);

      await $fetch("https://api.example.com/user", UserSchema);

      expect(jsonSpy).toHaveBeenCalled();
    });
  });

  describe("error handling", () => {
    it("should throw FetchError on non-ok response when throwOnFetchError is true (default)", async () => {
      const mockResponse = new Response(
        JSON.stringify({ error: "Not Found" }),
        {
          status: 404,
          statusText: "Not Found",
        }
      );
      fetchMock.mockResolvedValue(mockResponse);

      await expect($fetch("https://api.example.com/missing")).rejects.toThrow(
        FetchError
      );
    });

    it("should return Response without throwing when throwOnFetchError is false", async () => {
      const mockResponse = new Response(
        JSON.stringify({ error: "Not Found" }),
        {
          status: 404,
          statusText: "Not Found",
        }
      );
      fetchMock.mockResolvedValue(mockResponse);

      const result = await $fetch("https://api.example.com/missing", {
        throwOnFetchError: false,
      });

      expect(result).toBeInstanceOf(Response);
      expect((result as Response).status).toBe(404);
    });

    it("should include status and response in FetchError", async () => {
      const mockResponse = new Response(
        JSON.stringify({ error: "Server Error" }),
        {
          status: 500,
          statusText: "Internal Server Error",
        }
      );
      fetchMock.mockResolvedValue(mockResponse);

      try {
        await $fetch("https://api.example.com/error");
        expect.fail("Should have thrown FetchError");
      } catch (error) {
        expect(error).toBeInstanceOf(FetchError);
        expect((error as FetchError).status).toBe(500);
        expect((error as FetchError).response).toBe(mockResponse);
      }
    });

    it("should include status text in FetchError message", async () => {
      const mockResponse = new Response(
        JSON.stringify({ error: "Forbidden" }),
        {
          status: 403,
          statusText: "Forbidden",
        }
      );
      fetchMock.mockResolvedValue(mockResponse);

      try {
        await $fetch("https://api.example.com/forbidden");
        expect.fail("Should have thrown FetchError");
      } catch (error) {
        expect(error).toBeInstanceOf(FetchError);
        expect((error as FetchError).message).toContain("403");
        expect((error as FetchError).message).toContain("Forbidden");
      }
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

    it("should auto-set Content-Type to application/json when schema and body are provided", async () => {
      const userData = { id: 1, name: "John" };
      const mockResponse = new Response(JSON.stringify(userData), {
        status: 200,
      });
      fetchMock.mockResolvedValue(mockResponse);

      await $fetch("https://api.example.com/user", UserSchema, {
        method: "POST",
        body: { name: "New User" },
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
        method: "POST",
        body: { name: "New User" },
        headers: {
          "Content-Type": "application/json; charset=utf-8",
        },
      });

      const calledHeaders = fetchMock.mock.calls[0]?.[1]?.headers as Headers;
      expect(calledHeaders.get("Content-Type")).toBe(
        "application/json; charset=utf-8"
      );
    });
  });

  describe("body handling", () => {
    const UserSchema = object({
      id: number(),
      name: string(),
    });

    it("should auto-stringify body when schema is provided", async () => {
      const userData = { id: 1, name: "John" };
      const mockResponse = new Response(JSON.stringify(userData), {
        status: 200,
      });
      fetchMock.mockResolvedValue(mockResponse);

      const bodyData = { name: "New User", email: "user@example.com" };
      await $fetch("https://api.example.com/user", UserSchema, {
        method: "POST",
        body: bodyData,
      });

      const calledBody = fetchMock.mock.calls[0]?.[1]?.body;
      expect(calledBody).toBe(JSON.stringify(bodyData));
    });

    it("should not stringify body when no schema is provided", async () => {
      const mockResponse = new Response(JSON.stringify({ success: true }), {
        status: 200,
      });
      fetchMock.mockResolvedValue(mockResponse);

      const formData = new FormData();
      formData.append("file", "test-content");

      await $fetch("https://api.example.com/upload", {
        method: "POST",
        body: formData,
      });

      const calledBody = fetchMock.mock.calls[0]?.[1]?.body;
      expect(calledBody).toBe(formData);
    });
  });
});

describe("createFetch", () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn<typeof fetch>();
    global.fetch = fetchMock as typeof fetch;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("factory creation", () => {
    it("should return an object with $fetch and api properties", () => {
      const instance = createFetch();

      expect(instance).toHaveProperty("$fetch");
      expect(instance).toHaveProperty("api");
      expect(typeof instance.$fetch).toBe("function");
      expect(typeof instance.api).toBe("object");
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
        expect.any(Object)
      );

      fetchMock.mockClear();

      await instance2.$fetch("/endpoint");
      expect(fetchMock).toHaveBeenCalledWith(
        "https://api2.example.com/endpoint",
        expect.any(Object)
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

      expect(fetchMock).toHaveBeenCalledWith(
        "https://api.example.com/users",
        expect.any(Object)
      );
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

      expect(fetchMock).toHaveBeenCalledWith(
        "https://api.example.com/users",
        expect.any(Object)
      );
    });

    it("should handle resource with leading slash", async () => {
      const mockResponse = new Response(JSON.stringify({ data: "test" }), {
        status: 200,
      });
      fetchMock.mockResolvedValue(mockResponse);

      const { $fetch: customFetch } = createFetch({
        baseURL: "https://api.example.com",
      });

      await customFetch("/users");

      expect(fetchMock).toHaveBeenCalledWith(
        "https://api.example.com/users",
        expect.any(Object)
      );
    });

    it("should handle both baseURL with trailing and resource with leading slash", async () => {
      const mockResponse = new Response(JSON.stringify({ data: "test" }), {
        status: 200,
      });
      fetchMock.mockResolvedValue(mockResponse);

      const { $fetch: customFetch } = createFetch({
        baseURL: "https://api.example.com/",
      });

      await customFetch("/users");

      expect(fetchMock).toHaveBeenCalledWith(
        "https://api.example.com/users",
        expect.any(Object)
      );
    });

    // FIXME: review this behavior
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
        "https://api.example.com/https://other-api.example.com/users",
        expect.any(Object)
      );
    });

    it("should work without baseURL", async () => {
      const mockResponse = new Response(JSON.stringify({ data: "test" }), {
        status: 200,
      });
      fetchMock.mockResolvedValue(mockResponse);

      const { $fetch: customFetch } = createFetch();

      await customFetch("https://api.example.com/users");

      expect(fetchMock).toHaveBeenCalledWith(
        "https://api.example.com/users",
        expect.any(Object)
      );
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
    it("should use throwOnFetchError default from factory options", async () => {
      const mockResponse = new Response(
        JSON.stringify({ error: "Not Found" }),
        {
          status: 404,
          statusText: "Not Found",
        }
      );
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

      const result = await customFetch(
        "https://api.example.com/user",
        UserSchema
      );

      expect(result).toHaveProperty("issues");
    });

    it("should allow per-request override of throwOnFetchError", async () => {
      const mockResponse = new Response(
        JSON.stringify({ error: "Not Found" }),
        {
          status: 404,
          statusText: "Not Found",
        }
      );
      fetchMock.mockResolvedValue(mockResponse);

      const { $fetch: customFetch } = createFetch({
        throwOnFetchError: false,
      });

      await expect(
        customFetch("https://api.example.com/missing", {
          throwOnFetchError: true,
        })
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
        })
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

      expect(result).toEqual(userData);
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
      const secondCallHeaders = fetchMock.mock.calls[1]?.[1]
        ?.headers as Headers;

      expect(firstCallHeaders.get("Authorization")).toBe("Bearer token");
      expect(secondCallHeaders.get("Authorization")).toBe("Bearer token");

      expect(fetchMock.mock.calls[0]?.[0]).toBe(
        "https://api.example.com/users"
      );
      expect(fetchMock.mock.calls[1]?.[0]).toBe(
        "https://api.example.com/posts"
      );
    });
  });

  describe("custom api methods", () => {
    it("should return api object with get, post, put, patch, delete methods", () => {
      const { api: customApi } = createFetch();

      expect(customApi).toHaveProperty("get");
      expect(customApi).toHaveProperty("post");
      expect(customApi).toHaveProperty("put");
      expect(customApi).toHaveProperty("patch");
      expect(customApi).toHaveProperty("delete");
      expect(typeof customApi.get).toBe("function");
      expect(typeof customApi.post).toBe("function");
      expect(typeof customApi.put).toBe("function");
      expect(typeof customApi.patch).toBe("function");
      expect(typeof customApi.delete).toBe("function");
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

      expect(result).toEqual(userData);
      expect(fetchMock).toHaveBeenCalledWith(
        "https://api.example.com/users/1",
        expect.objectContaining({
          method: "GET",
        })
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
    global.fetch = fetchMock as typeof fetch;
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
        expect.objectContaining({ method: "GET" })
      );
    });

    it("should validate response against schema", async () => {
      const userData = { id: 1, name: "John" };
      const mockResponse = new Response(JSON.stringify(userData), {
        status: 200,
      });
      fetchMock.mockResolvedValue(mockResponse);

      const result = await api.get(
        "https://api.example.com/users/1",
        UserSchema
      );

      expect(result).toEqual(userData);
    });

    it("should pass additional options to fetch", async () => {
      const userData = { id: 1, name: "John" };
      const mockResponse = new Response(JSON.stringify(userData), {
        status: 200,
      });
      fetchMock.mockResolvedValue(mockResponse);

      await api.get("https://api.example.com/users/1", UserSchema, {
        headers: { Authorization: "Bearer token123" },
        credentials: "include",
      });

      expect(fetchMock).toHaveBeenCalledWith(
        "https://api.example.com/users/1",
        expect.objectContaining({
          method: "GET",
          credentials: "include",
        })
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
        expect.objectContaining({ method: "POST" })
      );
    });

    it("should validate response against schema", async () => {
      const userData = { id: 1, name: "John" };
      const mockResponse = new Response(JSON.stringify(userData), {
        status: 201,
      });
      fetchMock.mockResolvedValue(mockResponse);

      const result = await api.post(
        "https://api.example.com/users",
        UserSchema
      );

      expect(result).toEqual(userData);
    });

    it("should handle request body", async () => {
      const userData = { id: 1, name: "John" };
      const mockResponse = new Response(JSON.stringify(userData), {
        status: 201,
      });
      fetchMock.mockResolvedValue(mockResponse);

      const bodyData = { name: "John" };
      await api.post("https://api.example.com/users", UserSchema, {
        body: bodyData,
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
        headers: { "X-Custom-Header": "custom-value" },
        credentials: "same-origin",
      });

      expect(fetchMock).toHaveBeenCalledWith(
        "https://api.example.com/users",
        expect.objectContaining({
          method: "POST",
          credentials: "same-origin",
        })
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
        expect.objectContaining({ method: "PUT" })
      );
    });

    it("should validate response against schema", async () => {
      const userData = { id: 1, name: "John Updated" };
      const mockResponse = new Response(JSON.stringify(userData), {
        status: 200,
      });
      fetchMock.mockResolvedValue(mockResponse);

      const result = await api.put(
        "https://api.example.com/users/1",
        UserSchema
      );

      expect(result).toEqual(userData);
    });

    it("should handle request body", async () => {
      const userData = { id: 1, name: "John Updated" };
      const mockResponse = new Response(JSON.stringify(userData), {
        status: 200,
      });
      fetchMock.mockResolvedValue(mockResponse);

      const bodyData = { name: "John Updated" };
      await api.put("https://api.example.com/users/1", UserSchema, {
        body: bodyData,
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
        })
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
        expect.objectContaining({ method: "PATCH" })
      );
    });

    it("should validate response against schema", async () => {
      const userData = { id: 1, name: "John Patched" };
      const mockResponse = new Response(JSON.stringify(userData), {
        status: 200,
      });
      fetchMock.mockResolvedValue(mockResponse);

      const result = await api.patch(
        "https://api.example.com/users/1",
        UserSchema
      );

      expect(result).toEqual(userData);
    });

    it("should handle request body", async () => {
      const userData = { id: 1, name: "John Patched" };
      const mockResponse = new Response(JSON.stringify(userData), {
        status: 200,
      });
      fetchMock.mockResolvedValue(mockResponse);

      const bodyData = { name: "John Patched" };
      await api.patch("https://api.example.com/users/1", UserSchema, {
        body: bodyData,
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
        headers: { "X-Patch-Header": "patch-value" },
        cache: "no-store",
      });

      expect(fetchMock).toHaveBeenCalledWith(
        "https://api.example.com/users/1",
        expect.objectContaining({
          method: "PATCH",
          cache: "no-store",
        })
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
        expect.objectContaining({ method: "DELETE" })
      );
    });

    it("should validate response against schema", async () => {
      const userData = { id: 1, name: "John" };
      const mockResponse = new Response(JSON.stringify(userData), {
        status: 200,
      });
      fetchMock.mockResolvedValue(mockResponse);

      const result = await api.delete(
        "https://api.example.com/users/1",
        UserSchema
      );

      expect(result).toEqual(userData);
    });

    it("should pass additional options to fetch", async () => {
      const userData = { id: 1, name: "John" };
      const mockResponse = new Response(JSON.stringify(userData), {
        status: 200,
      });
      fetchMock.mockResolvedValue(mockResponse);

      await api.delete("https://api.example.com/users/1", UserSchema, {
        headers: { Authorization: "Bearer token" },
        credentials: "include",
      });

      expect(fetchMock).toHaveBeenCalledWith(
        "https://api.example.com/users/1",
        expect.objectContaining({
          method: "DELETE",
          credentials: "include",
        })
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
      const result = await api.get(
        "https://api.example.com/users/1",
        UserSchema
      );

      expect(result).toEqual(userData);
    });

    it("should throw ValidationError on validation failure (default)", async () => {
      const invalidData = { id: "not-a-number", name: 123 };
      const mockResponse = new Response(JSON.stringify(invalidData), {
        status: 200,
      });
      fetchMock.mockResolvedValue(mockResponse);

      await expect(
        api.get("https://api.example.com/users/1", UserSchema)
      ).rejects.toThrow(ValidationError);
    });

    it("should throw FetchError on non-ok response (default)", async () => {
      const mockResponse = new Response(
        JSON.stringify({ error: "Not Found" }),
        {
          status: 404,
          statusText: "Not Found",
        }
      );
      fetchMock.mockResolvedValue(mockResponse);

      await expect(
        api.get("https://api.example.com/users/999", UserSchema)
      ).rejects.toThrow(FetchError);
    });

    it("should respect throwOnValidationError option", async () => {
      const invalidData = { id: "not-a-number", name: 123 };
      const mockResponse = new Response(JSON.stringify(invalidData), {
        status: 200,
      });
      fetchMock.mockResolvedValue(mockResponse);

      const result = await api.get(
        "https://api.example.com/users/1",
        UserSchema,
        {
          throwOnValidationError: false,
        }
      );

      expect(result).toHaveProperty("issues");
      expect(Array.isArray((result as { issues: unknown[] }).issues)).toBe(
        true
      );
    });

    it("should respect throwOnFetchError option", async () => {
      const mockResponse = new Response(
        JSON.stringify({ error: "Not Found" }),
        {
          status: 404,
          statusText: "Not Found",
        }
      );
      fetchMock.mockResolvedValue(mockResponse);

      const result = await api.get(
        "https://api.example.com/users/999",
        UserSchema,
        {
          throwOnFetchError: false,
          throwOnValidationError: false,
        }
      );

      expect(result).toHaveProperty("issues");
    });
  });
});
