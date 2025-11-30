import { number, object, string } from "valibot";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { $fetch } from "../src";
import { ValidationError } from "../src/errors";

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
    it.todo(
      "should throw FetchError on non-ok response when throwOnFetchError is true (default)"
    );
    it.todo(
      "should return Response without throwing when throwOnFetchError is false"
    );
    it.todo("should include status and response in FetchError");
    it.todo("should include status text in FetchError message");
  });

  describe("headers", () => {
    it.todo("should pass custom headers to fetch");
    it.todo(
      "should auto-set Content-Type to application/json when schema and body are provided"
    );
    it.todo("should not override existing Content-Type header");
  });

  describe("body handling", () => {
    it.todo("should auto-stringify body when schema is provided");
    it.todo("should not stringify body when no schema is provided");
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
    it.todo("should return an object with $fetch and api properties");
    it.todo("should create independent fetch instances");
  });

  describe("baseURL", () => {
    it.todo("should prepend baseURL to relative paths");
    it.todo("should handle baseURL with trailing slash");
    it.todo("should handle resource with leading slash");
    it.todo(
      "should handle both baseURL with trailing and resource with leading slash"
    );
    it.todo("should not modify absolute URLs");
    it.todo("should work without baseURL");
  });

  describe("default headers", () => {
    it.todo("should include default headers in all requests");
    it.todo("should allow request headers to override default headers");
    it.todo("should merge default and request headers");
  });

  describe("default options", () => {
    it.todo("should use throwOnFetchError default from factory options");
    it.todo("should use throwOnValidationError default from factory options");
    it.todo("should allow per-request override of throwOnFetchError");
    it.todo("should allow per-request override of throwOnValidationError");
  });

  describe("custom $fetch behavior", () => {
    it.todo("should behave like global $fetch with schema validation");
    it.todo("should behave like global $fetch without schema");
    it.todo("should apply factory defaults to all requests");
  });

  describe("custom api methods", () => {
    it.todo(
      "should return api object with get, post, put, patch, delete methods"
    );
    it.todo("should apply factory defaults to api method requests");
  });
});

describe("api convenience methods", () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn<typeof fetch>();
    global.fetch = fetchMock as typeof fetch;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("api.get", () => {
    it.todo("should make a GET request");
    it.todo("should validate response against schema");
    it.todo("should pass additional options to fetch");
  });

  describe("api.post", () => {
    it.todo("should make a POST request");
    it.todo("should validate response against schema");
    it.todo("should handle request body");
    it.todo("should pass additional options to fetch");
  });

  describe("api.put", () => {
    it.todo("should make a PUT request");
    it.todo("should validate response against schema");
    it.todo("should handle request body");
    it.todo("should pass additional options to fetch");
  });

  describe("api.patch", () => {
    it.todo("should make a PATCH request");
    it.todo("should validate response against schema");
    it.todo("should handle request body");
    it.todo("should pass additional options to fetch");
  });

  describe("api.delete", () => {
    it.todo("should make a DELETE request");
    it.todo("should validate response against schema");
    it.todo("should pass additional options to fetch");
  });

  describe("shared behavior", () => {
    it.todo("should always require a schema parameter");
    it.todo("should throw ValidationError on validation failure (default)");
    it.todo("should throw FetchError on non-ok response (default)");
    it.todo("should respect throwOnValidationError option");
    it.todo("should respect throwOnFetchError option");
  });
});
