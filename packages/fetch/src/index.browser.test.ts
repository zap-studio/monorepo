import type { Logger } from "@zap-studio/logger";
import type { StandardSchemaV1 } from "@zap-studio/validation";

import { isStandardSchema } from "@zap-studio/validation";
import { ValidationError } from "@zap-studio/validation/errors";
import { type } from "arktype";
import { array, boolean, email, number, object, optional, pipe, string } from "valibot";
import { type Mock, afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";

import { FetchError } from "./errors.ts";
import { $fetch, api, createFetch, GLOBAL_DEFAULTS } from "./index.ts";

/** The arguments a recorded `fetch` call was made with. Throws when that call never happened. */
const fetchCall = (mock: Mock<typeof fetch>, index = 0): Parameters<typeof fetch> => {
  const call = mock.mock.calls[index];
  if (!call) {
    throw new Error(`fetch was not called ${index + 1} time(s)`);
  }
  return call;
};

/** The `Headers` a recorded `fetch` call carried. `$fetch` always builds a native `Headers` for `init.headers`. */
const fetchCallHeaders = (mock: Mock<typeof fetch>, index = 0): Headers => {
  const [, init] = fetchCall(mock, index);
  if (!(init?.headers instanceof Headers)) {
    throw new TypeError("fetch was not called with a Headers instance");
  }
  return init.headers;
};

/** The `RequestInit` a recorded `fetch` call carried. */
const fetchCallInit = (mock: Mock<typeof fetch>, index = 0): RequestInit => {
  const [, init] = fetchCall(mock, index);
  if (!init) {
    throw new Error("fetch was called without a RequestInit");
  }
  return init;
};

/** The `Request` a recorded `fetch` call carried. */
const fetchCallRequest = (mock: Mock<typeof fetch>, index = 0): Request => {
  const [input] = fetchCall(mock, index);
  if (!(input instanceof Request)) {
    throw new TypeError("fetch was not called with a Request");
  }
  return input;
};

/** The value of a passing validation result. Throws when the result carries issues instead. */
const validatedValue = <T>(result: StandardSchemaV1.Result<T>): T => {
  if (result.issues) {
    throw new Error(`expected validation to pass, got ${JSON.stringify(result.issues)}`);
  }
  return result.value;
};

/** A caught value narrowed to `FetchError`. Throws when it is something else. */
const asFetchError = (error: unknown): FetchError => {
  if (!(error instanceof FetchError)) {
    throw new TypeError(`expected a FetchError, got ${String(error)}`);
  }
  return error;
};

const TEST_URL = "https://api.example.com/test";
const USER_URL = "https://api.example.com/user";
const NOT_A_NUMBER_VALUE = "not-a-number";
const MISSING_URL = "https://api.example.com/missing";
const BEARER_TOKEN_123 = "Bearer token123";
const CUSTOM_HEADER_VALUE = "custom-value";
const CONTENT_TYPE_HEADER = "Content-Type";
const USER_1_URL = "https://api.example.com/users/1";
const USERS_URL = "https://api.example.com/users";
const BASE_URL_TRAILING_SLASH = "https://api.example.com/";
const BASE_URL = "https://api.example.com";
const OTHER_API_USERS_URL = "https://other-api.example.com/users";
const BEARER_DEFAULT_TOKEN = "Bearer default-token";
const BEARER_TOKEN = "Bearer token";
const UPDATED_USER_NAME = "John Updated";
const PATCHED_USER_NAME = "John Patched";
const EMAIL_TYPE_TAG = "string.email";
const MOCK_EMAIL = "test@example.com";
const INVALID_EMAIL_VALUE = "not-an-email";
const STATUS_URL = "https://api.example.com/status";
const ITEMS_URL = "https://api.example.com/items";

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

const captureRejectedError = async (run: () => Promise<unknown>): Promise<unknown> => {
  try {
    await run();
  } catch (error) {
    return error;
  }

  throw new Error("Expected promise to reject");
};

describe("$fetch basic functionality", () => {
  let fetchMock: Mock<typeof fetch>;

  beforeEach(() => {
    fetchMock = vi.fn<typeof fetch>();
    globalThis.fetch = fetchMock;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should make a fetch request to the given URL", async () => {
    const mockResponse = new Response(JSON.stringify({ data: "test" }), {
      status: 200,
    });
    fetchMock.mockResolvedValue(mockResponse);

    await $fetch(TEST_URL);

    expect(fetchMock).toHaveBeenCalledWith(TEST_URL, expect.any(Object));
  });

  it("should return raw Response when no schema is provided", async () => {
    const mockResponse = new Response(JSON.stringify({ data: "test" }), {
      status: 200,
    });
    fetchMock.mockResolvedValue(mockResponse);

    const result = await $fetch(TEST_URL);

    expect(result).toBeInstanceOf(Response);
    expect(result).toBe(mockResponse);
  });

  it("should pass RequestInit options to fetch", async () => {
    const mockResponse = new Response(JSON.stringify({ data: "test" }), {
      status: 200,
    });
    fetchMock.mockResolvedValue(mockResponse);

    await $fetch(TEST_URL, {
      credentials: "include",
      method: "POST",
      mode: "cors",
    });

    expect(fetchMock).toHaveBeenCalledWith(
      TEST_URL,
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

      await $fetch(TEST_URL, { method });

      expect(fetchMock).toHaveBeenCalledWith(TEST_URL, expect.objectContaining({ method }));

      fetchMock.mockClear();
    }
  });
});
describe("$fetch schema validation", () => {
  let fetchMock: Mock<typeof fetch>;

  beforeEach(() => {
    fetchMock = vi.fn<typeof fetch>();
    globalThis.fetch = fetchMock;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

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

    const result = await $fetch(USER_URL, UserSchema);

    expect(result).toStrictEqual(userData);
  });

  it("should return validated data when schema validation passes", async () => {
    const userData = { id: 42, name: "Jane Doe" };
    const mockResponse = new Response(JSON.stringify(userData), {
      status: 200,
    });
    fetchMock.mockResolvedValue(mockResponse);

    const result = await $fetch(USER_URL, UserSchema);

    expect(result).toStrictEqual(userData);
    expect(result).toHaveProperty("id", 42);
    expect(result).toHaveProperty("name", "Jane Doe");
  });

  it("should throw ValidationError when validation fails and throwOnValidationError is true (default)", async () => {
    const invalidData = { id: NOT_A_NUMBER_VALUE, name: 123 };
    const mockResponse = new Response(JSON.stringify(invalidData), {
      status: 200,
    });
    fetchMock.mockResolvedValue(mockResponse);

    await expect($fetch(USER_URL, UserSchema)).rejects.toThrow(ValidationError);
  });

  it("should return result object with issues when validation fails and throwOnValidationError is false", async () => {
    const invalidData = { id: NOT_A_NUMBER_VALUE, name: 123 };
    const mockResponse = new Response(JSON.stringify(invalidData), {
      status: 200,
    });
    fetchMock.mockResolvedValue(mockResponse);

    const result = await $fetch(USER_URL, UserSchema, {
      throwOnValidationError: false,
    });

    expect(Array.isArray(result.issues)).toBeTruthy();
  });

  it("should return result object with value when validation passes and throwOnValidationError is false", async () => {
    const userData = { id: 1, name: "John" };
    const mockResponse = new Response(JSON.stringify(userData), {
      status: 200,
    });
    fetchMock.mockResolvedValue(mockResponse);

    const result = await $fetch(USER_URL, UserSchema, {
      throwOnValidationError: false,
    });

    expect(validatedValue(result)).toStrictEqual(userData);
  });

  it("should parse response as JSON when schema is provided", async () => {
    const userData = { id: 1, name: "John" };
    const mockResponse = new Response(JSON.stringify(userData), {
      status: 200,
    });
    const jsonSpy = vi.spyOn(mockResponse, "json");
    fetchMock.mockResolvedValue(mockResponse);

    await $fetch(USER_URL, UserSchema);

    expect(jsonSpy).toHaveBeenCalledWith();
  });
});
describe("$fetch error handling", () => {
  let fetchMock: Mock<typeof fetch>;

  beforeEach(() => {
    fetchMock = vi.fn<typeof fetch>();
    globalThis.fetch = fetchMock;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should throw FetchError on non-ok response when throwOnFetchError is true (default)", async () => {
    const mockResponse = new Response(JSON.stringify({ error: "Not Found" }), {
      status: 404,
      statusText: "Not Found",
    });
    fetchMock.mockResolvedValue(mockResponse);

    await expect($fetch(MISSING_URL)).rejects.toThrow(FetchError);
  });

  it("should return Response without throwing when throwOnFetchError is false", async () => {
    const mockResponse = new Response(JSON.stringify({ error: "Not Found" }), {
      status: 404,
      statusText: "Not Found",
    });
    fetchMock.mockResolvedValue(mockResponse);

    const result = await $fetch(MISSING_URL, {
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

    expect(asFetchError(error).status).toBe(500);
    expect(asFetchError(error).response).toBe(mockResponse);
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

    expect(asFetchError(error).message).toContain("403");
    expect(asFetchError(error).message).toContain("Forbidden");
  });
});
describe("$fetch headers", () => {
  let fetchMock: Mock<typeof fetch>;

  beforeEach(() => {
    fetchMock = vi.fn<typeof fetch>();
    globalThis.fetch = fetchMock;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const UserSchema = object({
    id: number(),
    name: string(),
  });

  it("should pass custom headers to fetch", async () => {
    const mockResponse = new Response(JSON.stringify({ data: "test" }), {
      status: 200,
    });
    fetchMock.mockResolvedValue(mockResponse);

    await $fetch(TEST_URL, {
      headers: {
        Authorization: BEARER_TOKEN_123,
        "X-Custom-Header": CUSTOM_HEADER_VALUE,
      },
    });

    const calledHeaders = fetchCallHeaders(fetchMock);
    expect(calledHeaders.get("Authorization")).toBe(BEARER_TOKEN_123);
    expect(calledHeaders.get("X-Custom-Header")).toBe(CUSTOM_HEADER_VALUE);
  });

  it("should auto-set Content-Type to application/json when schema and json are provided", async () => {
    const userData = { id: 1, name: "John" };
    const mockResponse = new Response(JSON.stringify(userData), {
      status: 200,
    });
    fetchMock.mockResolvedValue(mockResponse);

    await $fetch(USER_URL, UserSchema, {
      json: { name: "New User" },
      method: "POST",
    });

    const calledHeaders = fetchCallHeaders(fetchMock);
    expect(calledHeaders.get(CONTENT_TYPE_HEADER)).toBe("application/json");
  });

  it("should not override existing Content-Type header", async () => {
    const userData = { id: 1, name: "John" };
    const mockResponse = new Response(JSON.stringify(userData), {
      status: 200,
    });
    fetchMock.mockResolvedValue(mockResponse);

    await $fetch(USER_URL, UserSchema, {
      headers: {
        [CONTENT_TYPE_HEADER]: "application/json; charset=utf-8",
      },
      json: { name: "New User" },
      method: "POST",
    });

    const calledHeaders = fetchCallHeaders(fetchMock);
    expect(calledHeaders.get(CONTENT_TYPE_HEADER)).toBe("application/json; charset=utf-8");
  });
});
describe("$fetch body handling", () => {
  let fetchMock: Mock<typeof fetch>;

  beforeEach(() => {
    fetchMock = vi.fn<typeof fetch>();
    globalThis.fetch = fetchMock;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

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
    await $fetch(USER_URL, UserSchema, {
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
    await $fetch(USER_URL, {
      json: bodyData,
      method: "POST",
    });

    const calledBody = fetchMock.mock.calls[0]?.[1]?.body;
    expect(calledBody).toBe(JSON.stringify(bodyData));
    const calledHeaders = new Headers(fetchMock.mock.calls[0]?.[1]?.headers);
    expect(calledHeaders.get(CONTENT_TYPE_HEADER)).toBe("application/json");
  });

  it("should stringify array json when no schema is provided", async () => {
    const mockResponse = new Response(JSON.stringify({ success: true }), {
      status: 200,
    });
    fetchMock.mockResolvedValue(mockResponse);

    const bodyData = [{ token_id: "token_123" }];
    await $fetch(USER_URL, {
      json: bodyData,
      method: "POST",
    });

    const calledBody = fetchMock.mock.calls[0]?.[1]?.body;
    expect(calledBody).toBe(JSON.stringify(bodyData));
    const calledHeaders = new Headers(fetchMock.mock.calls[0]?.[1]?.headers);
    expect(calledHeaders.get(CONTENT_TYPE_HEADER)).toBe("application/json");
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

describe("createFetch factory creation", () => {
  let fetchMock: Mock<typeof fetch>;

  beforeEach(() => {
    fetchMock = vi.fn<typeof fetch>();
    globalThis.fetch = fetchMock;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

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
    expect(fetchMock).toHaveBeenCalledWith("https://api1.example.com/endpoint", expect.any(Object));

    fetchMock.mockClear();

    await instance2.$fetch("/endpoint");
    expect(fetchMock).toHaveBeenCalledWith("https://api2.example.com/endpoint", expect.any(Object));
  });
});
describe("createFetch baseURL", () => {
  let fetchMock: Mock<typeof fetch>;

  beforeEach(() => {
    fetchMock = vi.fn<typeof fetch>();
    globalThis.fetch = fetchMock;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should prepend baseURL to relative paths", async () => {
    const mockResponse = new Response(JSON.stringify({ data: "test" }), {
      status: 200,
    });
    fetchMock.mockResolvedValue(mockResponse);

    const { $fetch: customFetch } = createFetch({
      baseURL: BASE_URL,
    });

    await customFetch("users");

    expect(fetchMock).toHaveBeenCalledWith(USERS_URL, expect.any(Object));
  });

  it("should handle baseURL with trailing slash", async () => {
    const mockResponse = new Response(JSON.stringify({ data: "test" }), {
      status: 200,
    });
    fetchMock.mockResolvedValue(mockResponse);

    const { $fetch: customFetch } = createFetch({
      baseURL: BASE_URL_TRAILING_SLASH,
    });

    await customFetch("users");

    expect(fetchMock).toHaveBeenCalledWith(USERS_URL, expect.any(Object));
  });

  it("should handle input with leading slash", async () => {
    const mockResponse = new Response(JSON.stringify({ data: "test" }), {
      status: 200,
    });
    fetchMock.mockResolvedValue(mockResponse);

    const { $fetch: customFetch } = createFetch({
      baseURL: BASE_URL,
    });

    await customFetch("/users");

    expect(fetchMock).toHaveBeenCalledWith(USERS_URL, expect.any(Object));
  });

  it("should handle both baseURL with trailing and input with leading slash", async () => {
    const mockResponse = new Response(JSON.stringify({ data: "test" }), {
      status: 200,
    });
    fetchMock.mockResolvedValue(mockResponse);

    const { $fetch: customFetch } = createFetch({
      baseURL: BASE_URL_TRAILING_SLASH,
    });

    await customFetch("/users");

    expect(fetchMock).toHaveBeenCalledWith(USERS_URL, expect.any(Object));
  });

  it("should not modify absolute URLs", async () => {
    const mockResponse = new Response(JSON.stringify({ data: "test" }), {
      status: 200,
    });
    fetchMock.mockResolvedValue(mockResponse);

    const { $fetch: customFetch } = createFetch({
      baseURL: BASE_URL,
    });

    await customFetch(OTHER_API_USERS_URL);

    expect(fetchMock).toHaveBeenCalledWith(OTHER_API_USERS_URL, expect.any(Object));
  });

  it("should resolve protocol-relative URLs with the base protocol", async () => {
    const mockResponse = new Response(JSON.stringify({ data: "test" }), {
      status: 200,
    });
    fetchMock.mockResolvedValue(mockResponse);

    const { $fetch: customFetch } = createFetch({
      baseURL: BASE_URL,
    });

    await customFetch("//other-api.example.com/users");

    expect(fetchMock).toHaveBeenCalledWith(OTHER_API_USERS_URL, expect.any(Object));
  });

  it("should work without baseURL", async () => {
    const mockResponse = new Response(JSON.stringify({ data: "test" }), {
      status: 200,
    });
    fetchMock.mockResolvedValue(mockResponse);

    const { $fetch: customFetch } = createFetch();

    await customFetch(USERS_URL);

    expect(fetchMock).toHaveBeenCalledWith(USERS_URL, expect.any(Object));
  });
});
describe("createFetch default headers", () => {
  let fetchMock: Mock<typeof fetch>;

  beforeEach(() => {
    fetchMock = vi.fn<typeof fetch>();
    globalThis.fetch = fetchMock;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should include default headers in all requests", async () => {
    const mockResponse = new Response(JSON.stringify({ data: "test" }), {
      status: 200,
    });
    fetchMock.mockResolvedValue(mockResponse);

    const { $fetch: customFetch } = createFetch({
      headers: {
        Authorization: BEARER_DEFAULT_TOKEN,
        "X-API-Key": "api-key-123",
      },
    });

    await customFetch(USERS_URL);

    const calledHeaders = fetchCallHeaders(fetchMock);
    expect(calledHeaders.get("Authorization")).toBe(BEARER_DEFAULT_TOKEN);
    expect(calledHeaders.get("X-API-Key")).toBe("api-key-123");
  });

  it("should allow request headers to override default headers", async () => {
    const mockResponse = new Response(JSON.stringify({ data: "test" }), {
      status: 200,
    });
    fetchMock.mockResolvedValue(mockResponse);

    const { $fetch: customFetch } = createFetch({
      headers: {
        Authorization: BEARER_DEFAULT_TOKEN,
      },
    });

    await customFetch(USERS_URL, {
      headers: {
        Authorization: "Bearer override-token",
      },
    });

    const calledHeaders = fetchCallHeaders(fetchMock);
    expect(calledHeaders.get("Authorization")).toBe("Bearer override-token");
  });

  it("should merge default and request headers", async () => {
    const mockResponse = new Response(JSON.stringify({ data: "test" }), {
      status: 200,
    });
    fetchMock.mockResolvedValue(mockResponse);

    const { $fetch: customFetch } = createFetch({
      headers: {
        Authorization: BEARER_DEFAULT_TOKEN,
        "X-Default-Header": "default-value",
      },
    });

    await customFetch(USERS_URL, {
      headers: {
        "X-Request-Header": "request-value",
      },
    });

    const calledHeaders = fetchCallHeaders(fetchMock);
    expect(calledHeaders.get("Authorization")).toBe(BEARER_DEFAULT_TOKEN);
    expect(calledHeaders.get("X-Default-Header")).toBe("default-value");
    expect(calledHeaders.get("X-Request-Header")).toBe("request-value");
  });
});
describe("createFetch default options", () => {
  let fetchMock: Mock<typeof fetch>;

  beforeEach(() => {
    fetchMock = vi.fn<typeof fetch>();
    globalThis.fetch = fetchMock;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

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

    await customFetch(USERS_URL);

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

    const result = await customFetch(MISSING_URL);

    expect(result).toBeInstanceOf(Response);
    expect(result.status).toBe(404);
  });

  it("should use throwOnValidationError default from factory options", async () => {
    const UserSchema = object({
      id: number(),
      name: string(),
    });
    const invalidData = { id: NOT_A_NUMBER_VALUE, name: 123 };
    const mockResponse = new Response(JSON.stringify(invalidData), {
      status: 200,
    });
    fetchMock.mockResolvedValue(mockResponse);

    const { $fetch: customFetch } = createFetch({
      throwOnValidationError: false,
    });

    const result = await customFetch(USER_URL, UserSchema);

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
      customFetch(MISSING_URL, {
        throwOnFetchError: true,
      }),
    ).rejects.toThrow(FetchError);
  });

  it("should allow per-request override of throwOnValidationError", async () => {
    const UserSchema = object({
      id: number(),
      name: string(),
    });
    const invalidData = { id: NOT_A_NUMBER_VALUE, name: 123 };
    const mockResponse = new Response(JSON.stringify(invalidData), {
      status: 200,
    });
    fetchMock.mockResolvedValue(mockResponse);

    const { $fetch: customFetch } = createFetch({
      throwOnValidationError: false,
    });

    await expect(
      customFetch(USER_URL, UserSchema, {
        throwOnValidationError: true,
      }),
    ).rejects.toThrow(ValidationError);
  });
});
describe("createFetch custom $fetch behavior", () => {
  let fetchMock: Mock<typeof fetch>;

  beforeEach(() => {
    fetchMock = vi.fn<typeof fetch>();
    globalThis.fetch = fetchMock;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

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
      baseURL: BASE_URL,
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
      baseURL: BASE_URL,
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
      baseURL: BASE_URL,
      headers: {
        Authorization: BEARER_TOKEN,
      },
    });

    await customFetch("/users");
    await customFetch("/posts");

    expect(fetchMock).toHaveBeenCalledTimes(2);

    const firstCallHeaders = fetchCallHeaders(fetchMock);
    const secondCallHeaders = fetchCallHeaders(fetchMock, 1);

    expect(firstCallHeaders.get("Authorization")).toBe(BEARER_TOKEN);
    expect(secondCallHeaders.get("Authorization")).toBe(BEARER_TOKEN);

    expect(fetchMock.mock.calls[0]?.[0]).toBe(USERS_URL);
    expect(fetchMock.mock.calls[1]?.[0]).toBe("https://api.example.com/posts");
  });
});
describe("createFetch custom api methods", () => {
  let fetchMock: Mock<typeof fetch>;

  beforeEach(() => {
    fetchMock = vi.fn<typeof fetch>();
    globalThis.fetch = fetchMock;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

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
      baseURL: BASE_URL,
      headers: {
        Authorization: BEARER_TOKEN,
      },
    });

    const result = await customApi.get("/users/1", UserSchema);

    expect(result).toStrictEqual(userData);
    expect(fetchMock).toHaveBeenCalledWith(
      USER_1_URL,
      expect.objectContaining({
        method: "GET",
      }),
    );

    const calledHeaders = fetchCallHeaders(fetchMock);
    expect(calledHeaders.get("Authorization")).toBe(BEARER_TOKEN);
  });
});

describe("api.get", () => {
  let fetchMock: Mock<typeof fetch>;

  const UserSchema = object({
    id: number(),
    name: string(),
  });

  beforeEach(() => {
    fetchMock = vi.fn<typeof fetch>();
    globalThis.fetch = fetchMock;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should make a GET request", async () => {
    const userData = { id: 1, name: "John" };
    const mockResponse = new Response(JSON.stringify(userData), {
      status: 200,
    });
    fetchMock.mockResolvedValue(mockResponse);

    await api.get(USER_1_URL, UserSchema);

    expect(fetchMock).toHaveBeenCalledWith(USER_1_URL, expect.objectContaining({ method: "GET" }));
  });

  it("should validate GET response against schema", async () => {
    const userData = { id: 1, name: "John" };
    const mockResponse = new Response(JSON.stringify(userData), {
      status: 200,
    });
    fetchMock.mockResolvedValue(mockResponse);

    const result = await api.get(USER_1_URL, UserSchema);

    expect(result).toStrictEqual(userData);
  });

  it("should pass additional GET options to fetch", async () => {
    const userData = { id: 1, name: "John" };
    const mockResponse = new Response(JSON.stringify(userData), {
      status: 200,
    });
    fetchMock.mockResolvedValue(mockResponse);

    await api.get(USER_1_URL, UserSchema, {
      credentials: "include",
      headers: { Authorization: BEARER_TOKEN_123 },
    });

    expect(fetchMock).toHaveBeenCalledWith(
      USER_1_URL,
      expect.objectContaining({
        credentials: "include",
        method: "GET",
      }),
    );
    const calledHeaders = fetchCallHeaders(fetchMock);
    expect(calledHeaders.get("Authorization")).toBe(BEARER_TOKEN_123);
  });
});
describe("api.post", () => {
  let fetchMock: Mock<typeof fetch>;

  const UserSchema = object({
    id: number(),
    name: string(),
  });

  beforeEach(() => {
    fetchMock = vi.fn<typeof fetch>();
    globalThis.fetch = fetchMock;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should make a POST request", async () => {
    const userData = { id: 1, name: "John" };
    const mockResponse = new Response(JSON.stringify(userData), {
      status: 201,
    });
    fetchMock.mockResolvedValue(mockResponse);

    await api.post(USERS_URL, UserSchema);

    expect(fetchMock).toHaveBeenCalledWith(USERS_URL, expect.objectContaining({ method: "POST" }));
  });

  it("should validate POST response against schema", async () => {
    const userData = { id: 1, name: "John" };
    const mockResponse = new Response(JSON.stringify(userData), {
      status: 201,
    });
    fetchMock.mockResolvedValue(mockResponse);

    const result = await api.post(USERS_URL, UserSchema);

    expect(result).toStrictEqual(userData);
  });

  it("should handle POST json request bodies", async () => {
    const userData = { id: 1, name: "John" };
    const mockResponse = new Response(JSON.stringify(userData), {
      status: 201,
    });
    fetchMock.mockResolvedValue(mockResponse);

    const bodyData = { name: "John" };
    await api.post(USERS_URL, UserSchema, {
      json: bodyData,
    });

    const calledBody = fetchMock.mock.calls[0]?.[1]?.body;
    expect(calledBody).toBe(JSON.stringify(bodyData));
  });

  it("should pass additional POST options to fetch", async () => {
    const userData = { id: 1, name: "John" };
    const mockResponse = new Response(JSON.stringify(userData), {
      status: 201,
    });
    fetchMock.mockResolvedValue(mockResponse);

    await api.post(USERS_URL, UserSchema, {
      credentials: "same-origin",
      headers: { "X-Custom-Header": CUSTOM_HEADER_VALUE },
    });

    expect(fetchMock).toHaveBeenCalledWith(
      USERS_URL,
      expect.objectContaining({
        credentials: "same-origin",
        method: "POST",
      }),
    );
    const calledHeaders = fetchCallHeaders(fetchMock);
    expect(calledHeaders.get("X-Custom-Header")).toBe(CUSTOM_HEADER_VALUE);
  });
});
describe("api.put", () => {
  let fetchMock: Mock<typeof fetch>;

  const UserSchema = object({
    id: number(),
    name: string(),
  });

  beforeEach(() => {
    fetchMock = vi.fn<typeof fetch>();
    globalThis.fetch = fetchMock;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should make a PUT request", async () => {
    const userData = { id: 1, name: UPDATED_USER_NAME };
    const mockResponse = new Response(JSON.stringify(userData), {
      status: 200,
    });
    fetchMock.mockResolvedValue(mockResponse);

    await api.put(USER_1_URL, UserSchema);

    expect(fetchMock).toHaveBeenCalledWith(USER_1_URL, expect.objectContaining({ method: "PUT" }));
  });

  it("should validate PUT response against schema", async () => {
    const userData = { id: 1, name: UPDATED_USER_NAME };
    const mockResponse = new Response(JSON.stringify(userData), {
      status: 200,
    });
    fetchMock.mockResolvedValue(mockResponse);

    const result = await api.put(USER_1_URL, UserSchema);

    expect(result).toStrictEqual(userData);
  });

  it("should handle PUT json request bodies", async () => {
    const userData = { id: 1, name: UPDATED_USER_NAME };
    const mockResponse = new Response(JSON.stringify(userData), {
      status: 200,
    });
    fetchMock.mockResolvedValue(mockResponse);

    const bodyData = { name: UPDATED_USER_NAME };
    await api.put(USER_1_URL, UserSchema, {
      json: bodyData,
    });

    const calledBody = fetchMock.mock.calls[0]?.[1]?.body;
    expect(calledBody).toBe(JSON.stringify(bodyData));
  });

  it("should pass additional PUT options to fetch", async () => {
    const userData = { id: 1, name: UPDATED_USER_NAME };
    const mockResponse = new Response(JSON.stringify(userData), {
      status: 200,
    });
    fetchMock.mockResolvedValue(mockResponse);

    await api.put(USER_1_URL, UserSchema, {
      headers: { Authorization: BEARER_TOKEN },
      mode: "cors",
    });

    expect(fetchMock).toHaveBeenCalledWith(
      USER_1_URL,
      expect.objectContaining({
        method: "PUT",
        mode: "cors",
      }),
    );
    const calledHeaders = fetchCallHeaders(fetchMock);
    expect(calledHeaders.get("Authorization")).toBe(BEARER_TOKEN);
  });
});
describe("api.patch", () => {
  let fetchMock: Mock<typeof fetch>;

  const UserSchema = object({
    id: number(),
    name: string(),
  });

  beforeEach(() => {
    fetchMock = vi.fn<typeof fetch>();
    globalThis.fetch = fetchMock;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should make a PATCH request", async () => {
    const userData = { id: 1, name: PATCHED_USER_NAME };
    const mockResponse = new Response(JSON.stringify(userData), {
      status: 200,
    });
    fetchMock.mockResolvedValue(mockResponse);

    await api.patch(USER_1_URL, UserSchema);

    expect(fetchMock).toHaveBeenCalledWith(
      USER_1_URL,
      expect.objectContaining({ method: "PATCH" }),
    );
  });

  it("should validate PATCH response against schema", async () => {
    const userData = { id: 1, name: PATCHED_USER_NAME };
    const mockResponse = new Response(JSON.stringify(userData), {
      status: 200,
    });
    fetchMock.mockResolvedValue(mockResponse);

    const result = await api.patch(USER_1_URL, UserSchema);

    expect(result).toStrictEqual(userData);
  });

  it("should handle PATCH json request bodies", async () => {
    const userData = { id: 1, name: PATCHED_USER_NAME };
    const mockResponse = new Response(JSON.stringify(userData), {
      status: 200,
    });
    fetchMock.mockResolvedValue(mockResponse);

    const bodyData = { name: PATCHED_USER_NAME };
    await api.patch(USER_1_URL, UserSchema, {
      json: bodyData,
    });

    const calledBody = fetchMock.mock.calls[0]?.[1]?.body;
    expect(calledBody).toBe(JSON.stringify(bodyData));
  });

  it("should pass additional PATCH options to fetch", async () => {
    const userData = { id: 1, name: PATCHED_USER_NAME };
    const mockResponse = new Response(JSON.stringify(userData), {
      status: 200,
    });
    fetchMock.mockResolvedValue(mockResponse);

    await api.patch(USER_1_URL, UserSchema, {
      cache: "no-store",
      headers: { "X-Patch-Header": "patch-value" },
    });

    expect(fetchMock).toHaveBeenCalledWith(
      USER_1_URL,
      expect.objectContaining({
        cache: "no-store",
        method: "PATCH",
      }),
    );
    const calledHeaders = fetchCallHeaders(fetchMock);
    expect(calledHeaders.get("X-Patch-Header")).toBe("patch-value");
  });
});
describe("api.delete", () => {
  let fetchMock: Mock<typeof fetch>;

  const UserSchema = object({
    id: number(),
    name: string(),
  });

  beforeEach(() => {
    fetchMock = vi.fn<typeof fetch>();
    globalThis.fetch = fetchMock;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should make a DELETE request", async () => {
    const userData = { id: 1, name: "John" };
    const mockResponse = new Response(JSON.stringify(userData), {
      status: 200,
    });
    fetchMock.mockResolvedValue(mockResponse);

    await api.delete(USER_1_URL, UserSchema);

    expect(fetchMock).toHaveBeenCalledWith(
      USER_1_URL,
      expect.objectContaining({ method: "DELETE" }),
    );
  });

  it("should validate DELETE response against schema", async () => {
    const userData = { id: 1, name: "John" };
    const mockResponse = new Response(JSON.stringify(userData), {
      status: 200,
    });
    fetchMock.mockResolvedValue(mockResponse);

    const result = await api.delete(USER_1_URL, UserSchema);

    expect(result).toStrictEqual(userData);
  });

  it("should pass additional DELETE options to fetch", async () => {
    const userData = { id: 1, name: "John" };
    const mockResponse = new Response(JSON.stringify(userData), {
      status: 200,
    });
    fetchMock.mockResolvedValue(mockResponse);

    await api.delete(USER_1_URL, UserSchema, {
      credentials: "include",
      headers: { Authorization: BEARER_TOKEN },
    });

    expect(fetchMock).toHaveBeenCalledWith(
      USER_1_URL,
      expect.objectContaining({
        credentials: "include",
        method: "DELETE",
      }),
    );
    const calledHeaders = fetchCallHeaders(fetchMock);
    expect(calledHeaders.get("Authorization")).toBe(BEARER_TOKEN);
  });
});
describe("api convenience methods shared behavior", () => {
  let fetchMock: Mock<typeof fetch>;

  const UserSchema = object({
    id: number(),
    name: string(),
  });

  beforeEach(() => {
    fetchMock = vi.fn<typeof fetch>();
    globalThis.fetch = fetchMock;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should always require a schema parameter", async () => {
    const userData = { id: 1, name: "John" };
    const mockResponse = new Response(JSON.stringify(userData), {
      status: 200,
    });
    fetchMock.mockResolvedValue(mockResponse);

    // All api methods require a schema - testing with TypeScript compile-time check
    // The schema is always the second parameter
    const result = await api.get(USER_1_URL, UserSchema);

    expect(result).toStrictEqual(userData);
  });

  it("should throw ValidationError on validation failure (default)", async () => {
    const invalidData = { id: NOT_A_NUMBER_VALUE, name: 123 };
    const mockResponse = new Response(JSON.stringify(invalidData), {
      status: 200,
    });
    fetchMock.mockResolvedValue(mockResponse);

    await expect(api.get(USER_1_URL, UserSchema)).rejects.toThrow(ValidationError);
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
    const invalidData = { id: NOT_A_NUMBER_VALUE, name: 123 };
    const mockResponse = new Response(JSON.stringify(invalidData), {
      status: 200,
    });
    fetchMock.mockResolvedValue(mockResponse);

    const result = await api.get(USER_1_URL, UserSchema, {
      throwOnValidationError: false,
    });

    expect(Array.isArray(result.issues)).toBeTruthy();
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
  let fetchMock: Mock<typeof fetch>;

  beforeEach(() => {
    fetchMock = vi.fn<typeof fetch>();
    globalThis.fetch = fetchMock;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("accepts URL instances as input", async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ ok: true })));

    await $fetch(new URL("/users", BASE_URL));

    expect(fetchMock).toHaveBeenCalledWith(USERS_URL, expect.any(Object));
  });

  it("accepts a Request input with no options", async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ ok: true })));
    const request = new Request(USERS_URL, {
      headers: { A: "1" },
      method: "POST",
    });

    await $fetch(request);

    const sentRequest = fetchCallRequest(fetchMock);
    expect(sentRequest).toBeInstanceOf(Request);
    expect(sentRequest.url).toBe(USERS_URL);
  });

  it("clones Request inputs, merges headers, and lets request-level options win", async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ ok: true })));
    const request = new Request(USERS_URL, {
      headers: { A: "1", B: "2" },
      method: "POST",
    });

    await $fetch(request, { headers: { B: "20", C: "3" }, method: "PATCH" });

    const sentRequest = fetchCallRequest(fetchMock);
    const init = fetchCallInit(fetchMock);
    const headers = new Headers(init.headers);

    expect(sentRequest).toBeInstanceOf(Request);
    expect(sentRequest).not.toBe(request);
    expect(sentRequest.url).toBe(USERS_URL);
    expect(init.method).toBe("PATCH");
    expect(headers.get("A")).toBe("1");
    expect(headers.get("B")).toBe("20");
    expect(headers.get("C")).toBe("3");
  });
});

describe("json and body conflicts", () => {
  let fetchMock: Mock<typeof fetch>;

  beforeEach(() => {
    fetchMock = vi.fn<typeof fetch>();
    globalThis.fetch = fetchMock;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("throws when json and body are both provided", async () => {
    const options = { body: "raw", json: { name: "Zap" }, method: "POST" };

    // @ts-expect-error body and json are intentionally both provided to test the runtime guard.
    await expect($fetch(USERS_URL, options)).rejects.toThrow(TypeError);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("sets Content-Type when default headers exist without one", async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ ok: true })));
    const { $fetch: customFetch } = createFetch({
      headers: { Authorization: BEARER_TOKEN },
    });

    await customFetch(USERS_URL, {
      json: { name: "Zap" },
      method: "POST",
    });

    const init = fetchCallInit(fetchMock);
    const headers = new Headers(init.headers);
    expect(headers.get("Authorization")).toBe(BEARER_TOKEN);
    expect(headers.get(CONTENT_TYPE_HEADER)).toBe("application/json");
  });
});

describe("URL and search param resolution", () => {
  let fetchMock: Mock<typeof fetch>;

  beforeEach(() => {
    fetchMock = vi.fn<typeof fetch>();
    globalThis.fetch = fetchMock;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("merges default, URL, and request search params in that order", async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ ok: true })));
    const { $fetch: customFetch } = createFetch({
      baseURL: BASE_URL,
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

    await $fetch(USERS_URL, {
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
      baseURL: BASE_URL_TRAILING_SLASH,
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
  let fetchMock: Mock<typeof fetch>;

  const UserSchema = object({
    id: number(),
    name: string(),
  });

  beforeEach(() => {
    fetchMock = vi.fn<typeof fetch>();
    globalThis.fetch = fetchMock;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("supports raw Response calls without a schema", async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ ok: true })));

    const result = await api.delete(USER_1_URL, {
      headers: { A: "1" },
    });

    expect(result).toBeInstanceOf(Response);
    expect(fetchMock).toHaveBeenCalledWith(
      USER_1_URL,
      expect.objectContaining({ method: "DELETE" }),
    );
  });

  it("preserves throwOnValidationError: true when explicitly provided", async () => {
    const invalidData = { id: NOT_A_NUMBER_VALUE, name: 123 };
    fetchMock.mockResolvedValue(new Response(JSON.stringify(invalidData)));

    await expect(
      api.put(USER_1_URL, UserSchema, {
        throwOnValidationError: true,
      }),
    ).rejects.toThrow(ValidationError);
  });

  it("lets the helper method win when runtime options contain a method", async () => {
    const userData = { id: 1, name: "John" };
    fetchMock.mockResolvedValue(new Response(JSON.stringify(userData)));

    // SAFETY: we skip api.patch's options type on purpose, because it does not expose method. This tests the runtime path where the helper's own PATCH method still wins.
    await api.patch(USER_1_URL, UserSchema, {
      method: "POST",
    } as never);

    expect(fetchMock).toHaveBeenCalledWith(
      USER_1_URL,
      expect.objectContaining({ method: "PATCH" }),
    );
  });
});

describe("@zap-studio/fetch browser runtime", () => {
  let originalFetch: typeof globalThis.fetch;
  let fetchMock: Mock<typeof fetch>;

  beforeEach(() => {
    originalFetch = globalThis.fetch;
    fetchMock = vi.fn<typeof fetch>();
    globalThis.fetch = fetchMock;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it("normalizes native Request inputs without losing browser Headers semantics", async () => {
    fetchMock.mockResolvedValue(new Response("ok"));
    const request = new Request(USERS_URL, {
      headers: { A: "1", B: "2" },
      method: "POST",
    });

    await $fetch(request, { headers: { B: "20", C: "3" }, method: "PATCH" });

    const sentRequest = fetchCallRequest(fetchMock);
    const init = fetchCallInit(fetchMock);
    const headers = new Headers(init.headers);

    expect(sentRequest).toBeInstanceOf(Request);
    expect(sentRequest).not.toBe(request);
    expect(sentRequest.url).toBe(USERS_URL);
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
      baseURL: BASE_URL,
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

    const result = await $fetch(USERS_URL, {
      headers: { Accept: "application/json" },
    });

    expect(result).toBe(response);
    expect(result).toBeInstanceOf(Response);
    expect(fetchMock).toHaveBeenCalledWith(
      USERS_URL,
      expect.objectContaining({
        headers: expect.any(Headers),
      }),
    );
  });

  it("uses Request inputs as native fetch Request arguments", async () => {
    fetchMock.mockResolvedValue(new Response("ok"));

    await $fetch(
      new Request(USERS_URL, {
        headers: { A: "1" },
        method: "POST",
      }),
      {
        headers: { B: "2" },
      },
    );

    const request = fetchCallRequest(fetchMock);
    const init = fetchCallInit(fetchMock);
    expect(request.url).toBe(USERS_URL);
    expect(new Headers(init.headers).get("B")).toBe("2");
  });

  it("serializes json bodies and preserves explicit content type casing", async () => {
    fetchMock.mockResolvedValue(new Response("ok"));

    await $fetch(USERS_URL, {
      headers: { "content-type": "application/vnd.api+json" },
      json: { name: "Zap" },
      method: "POST",
    });

    const init = fetchCallInit(fetchMock);
    expect(init.body).toBe(JSON.stringify({ name: "Zap" }));
    expect(new Headers(init.headers).get("content-type")).toBe("application/vnd.api+json");
  });

  it("applies browser fetch defaults from createFetch", async () => {
    fetchMock.mockResolvedValue(new Response("ok"));
    const client = createFetch({
      baseURL: BASE_URL,
      headers: { Authorization: BEARER_TOKEN },
    });

    await client.$fetch("/users", {
      headers: { Accept: "application/json" },
      searchParams: { page: "1" },
    });

    const [url] = fetchCall(fetchMock);
    const headers = new Headers(fetchCallInit(fetchMock).headers);
    expect(url).toBe("https://api.example.com/users?page=1");
    expect(headers.get("authorization")).toBe(BEARER_TOKEN);
    expect(headers.get("accept")).toBe("application/json");
  });
});

describe("ArkType Standard Schema compatibility", () => {
  it("should expose ~standard property (ArkType)", () => {
    const schema = type({ id: "number" });
    expect("~standard" in schema).toBeTruthy();
    expect(schema["~standard"]).toBeDefined();
  });

  it("should be recognized by isStandardSchema (ArkType)", () => {
    const schema = type({ id: "number" });
    expect(isStandardSchema(schema)).toBeTruthy();
  });
});

describe("$fetch with ArkType schemas", () => {
  let fetchMock: Mock<typeof fetch>;

  beforeEach(() => {
    fetchMock = vi.fn<typeof fetch>();
    globalThis.fetch = fetchMock;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should validate with ArkType object schema", async () => {
    const schema = type({
      email: EMAIL_TYPE_TAG,
      id: "number",
      name: "string",
    });

    const mockData = { email: MOCK_EMAIL, id: 1, name: "Test User" };

    fetchMock.mockResolvedValue(
      new Response(JSON.stringify(mockData), {
        headers: { "content-type": "application/json" },
        status: 200,
        statusText: "OK",
      }),
    );

    const result = await $fetch(USER_URL, schema);

    expect(result).toStrictEqual(mockData);
  });

  it("should throw ValidationError on invalid data with ArkType", async () => {
    const schema = type({
      email: EMAIL_TYPE_TAG,
      id: "number",
    });

    const invalidData = { email: INVALID_EMAIL_VALUE, id: 1 };

    fetchMock.mockResolvedValue(
      new Response(JSON.stringify(invalidData), {
        headers: { "content-type": "application/json" },
        status: 200,
        statusText: "OK",
      }),
    );

    await expect($fetch(USER_URL, schema)).rejects.toThrow(ValidationError);
  });

  it("should return validation result when throwOnValidationError is false with ArkType", async () => {
    const schema = type({
      email: EMAIL_TYPE_TAG,
      id: "number",
    });

    const invalidData = { email: INVALID_EMAIL_VALUE, id: 1 };

    fetchMock.mockResolvedValue(
      new Response(JSON.stringify(invalidData), {
        headers: { "content-type": "application/json" },
        status: 200,
        statusText: "OK",
      }),
    );

    const result = await $fetch(USER_URL, schema, {
      throwOnValidationError: false,
    });

    expect(Array.isArray(result.issues)).toBeTruthy();
  });

  it("should return successful validation result when data is valid and throwOnValidationError is false (ArkType)", async () => {
    const schema = type({
      email: EMAIL_TYPE_TAG,
      id: "number",
    });

    const validData = { email: MOCK_EMAIL, id: 1 };

    fetchMock.mockResolvedValue(
      new Response(JSON.stringify(validData), {
        headers: { "content-type": "application/json" },
        status: 200,
        statusText: "OK",
      }),
    );

    const result = await $fetch(USER_URL, schema, {
      throwOnValidationError: false,
    });

    expect(validatedValue(result)).toStrictEqual(validData);
    expect(result.issues).toBeUndefined();
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

    fetchMock.mockResolvedValue(
      new Response(JSON.stringify(mockData), {
        headers: { "content-type": "application/json" },
        status: 200,
        statusText: "OK",
      }),
    );

    const result = await $fetch(USERS_URL, schema);

    expect(result).toStrictEqual(mockData);
  });

  it("should work with api.get using ArkType", async () => {
    const schema = type({ success: "boolean" });
    const mockData = { success: true };

    fetchMock.mockResolvedValue(
      new Response(JSON.stringify(mockData), {
        headers: { "content-type": "application/json" },
        status: 200,
        statusText: "OK",
      }),
    );

    const result = await api.get(STATUS_URL, schema);

    expect(result).toStrictEqual(mockData);
  });

  it("should work with api.post using ArkType", async () => {
    const schema = type({ created: "boolean", id: "number" });
    const mockData = { created: true, id: 123 };
    const body = { name: "New Item" };

    fetchMock.mockResolvedValue(
      new Response(JSON.stringify(mockData), {
        headers: { "content-type": "application/json" },
        status: 201,
        statusText: "Created",
      }),
    );

    const result = await api.post(ITEMS_URL, schema, {
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

    fetchMock.mockResolvedValue(
      new Response(JSON.stringify(mockData), {
        headers: { "content-type": "application/json" },
        status: 200,
        statusText: "OK",
      }),
    );

    const result = await $fetch("https://api.example.com/product", schema);

    expect(result).toStrictEqual(mockData);
  });

  it("should work with ArkType union types", async () => {
    const schema = type("string|number");
    const mockData = "test-string";

    fetchMock.mockResolvedValue(
      new Response(JSON.stringify(mockData), {
        headers: { "content-type": "application/json" },
        status: 200,
        statusText: "OK",
      }),
    );

    const result = await $fetch("https://api.example.com/value", schema);

    expect(result).toBe(mockData);
  });
});

describe("Valibot Standard Schema compatibility", () => {
  it("should expose ~standard property (Valibot)", () => {
    const schema = object({ id: number() });
    expect("~standard" in schema).toBeTruthy();
    expect(schema["~standard"]).toBeDefined();
  });

  it("should be recognized by isStandardSchema (Valibot)", () => {
    const schema = object({ id: number() });
    expect(isStandardSchema(schema)).toBeTruthy();
  });
});

describe("$fetch with Valibot schemas", () => {
  let fetchMock: Mock<typeof fetch>;

  beforeEach(() => {
    fetchMock = vi.fn<typeof fetch>();
    globalThis.fetch = fetchMock;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should validate with Valibot object schema", async () => {
    const schema = object({
      email: pipe(string(), email()),
      id: number(),
      name: string(),
    });

    const mockData = { email: MOCK_EMAIL, id: 1, name: "Test User" };

    fetchMock.mockResolvedValue(
      new Response(JSON.stringify(mockData), {
        headers: { "content-type": "application/json" },
        status: 200,
        statusText: "OK",
      }),
    );

    const result = await $fetch(USER_URL, schema);

    expect(result).toStrictEqual(mockData);
  });

  it("should throw ValidationError on invalid data with Valibot", async () => {
    const schema = object({
      email: pipe(string(), email()),
      id: number(),
    });

    const invalidData = { email: INVALID_EMAIL_VALUE, id: 1 };

    fetchMock.mockResolvedValue(
      new Response(JSON.stringify(invalidData), {
        headers: { "content-type": "application/json" },
        status: 200,
        statusText: "OK",
      }),
    );

    await expect($fetch(USER_URL, schema)).rejects.toThrow(ValidationError);
  });

  it("should return validation result when throwOnValidationError is false with Valibot", async () => {
    const schema = object({
      email: pipe(string(), email()),
      id: number(),
    });

    const invalidData = { email: INVALID_EMAIL_VALUE, id: 1 };

    fetchMock.mockResolvedValue(
      new Response(JSON.stringify(invalidData), {
        headers: { "content-type": "application/json" },
        status: 200,
        statusText: "OK",
      }),
    );

    const result = await $fetch(USER_URL, schema, {
      throwOnValidationError: false,
    });

    expect(Array.isArray(result.issues)).toBeTruthy();
  });

  it("should return successful validation result when data is valid and throwOnValidationError is false (Valibot)", async () => {
    const schema = object({
      email: pipe(string(), email()),
      id: number(),
    });

    const validData = { email: MOCK_EMAIL, id: 1 };

    fetchMock.mockResolvedValue(
      new Response(JSON.stringify(validData), {
        headers: { "content-type": "application/json" },
        status: 200,
        statusText: "OK",
      }),
    );

    const result = await $fetch(USER_URL, schema, {
      throwOnValidationError: false,
    });

    expect(validatedValue(result)).toStrictEqual(validData);
    expect(result.issues).toBeUndefined();
  });

  it("should work with Valibot array schemas", async () => {
    const schema = array(
      object({
        id: number(),
        name: string(),
      }),
    );

    const mockData = [
      { id: 1, name: "User 1" },
      { id: 2, name: "User 2" },
    ];

    fetchMock.mockResolvedValue(
      new Response(JSON.stringify(mockData), {
        headers: { "content-type": "application/json" },
        status: 200,
        statusText: "OK",
      }),
    );

    const result = await $fetch(USERS_URL, schema);

    expect(result).toStrictEqual(mockData);
  });

  it("should work with api.get using Valibot", async () => {
    const schema = object({ success: boolean() });
    const mockData = { success: true };

    fetchMock.mockResolvedValue(
      new Response(JSON.stringify(mockData), {
        headers: { "content-type": "application/json" },
        status: 200,
        statusText: "OK",
      }),
    );

    const result = await api.get(STATUS_URL, schema);

    expect(result).toStrictEqual(mockData);
  });

  it("should work with api.post using Valibot", async () => {
    const schema = object({ created: boolean(), id: number() });
    const mockData = { created: true, id: 123 };
    const body = { name: "New Item" };

    fetchMock.mockResolvedValue(
      new Response(JSON.stringify(mockData), {
        headers: { "content-type": "application/json" },
        status: 201,
        statusText: "Created",
      }),
    );

    const result = await api.post(ITEMS_URL, schema, {
      body: JSON.stringify(body),
    });

    expect(result).toStrictEqual(mockData);
  });

  it("should work with Valibot optional fields", async () => {
    const schema = object({
      description: optional(string()),
      id: number(),
      name: string(),
    });

    const mockData = { id: 1, name: "Product" };

    fetchMock.mockResolvedValue(
      new Response(JSON.stringify(mockData), {
        headers: { "content-type": "application/json" },
        status: 200,
        statusText: "OK",
      }),
    );

    const result = await $fetch("https://api.example.com/product", schema);

    expect(result).toStrictEqual(mockData);
  });
});

describe("Zod Standard Schema compatibility", () => {
  it("should expose ~standard property (Zod)", () => {
    const schema = z.object({ id: z.number() });
    expect("~standard" in schema).toBeTruthy();
    expect(schema["~standard"]).toBeDefined();
  });

  it("should be recognized by isStandardSchema (Zod)", () => {
    const schema = z.object({ id: z.number() });
    expect(isStandardSchema(schema)).toBeTruthy();
  });
});

describe("$fetch with Zod schemas", () => {
  let fetchMock: Mock<typeof fetch>;

  beforeEach(() => {
    fetchMock = vi.fn<typeof fetch>();
    globalThis.fetch = fetchMock;
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

    const mockData = { email: MOCK_EMAIL, id: 1, name: "Test User" };

    fetchMock.mockResolvedValue(
      new Response(JSON.stringify(mockData), {
        headers: { "content-type": "application/json" },
        status: 200,
        statusText: "OK",
      }),
    );

    const result = await $fetch(USER_URL, schema);

    expect(result).toStrictEqual(mockData);
  });

  it("should throw ValidationError on invalid data with Zod", async () => {
    const schema = z.object({
      email: z.email(),
      id: z.number(),
    });

    const invalidData = { email: INVALID_EMAIL_VALUE, id: 1 };

    fetchMock.mockResolvedValue(
      new Response(JSON.stringify(invalidData), {
        headers: { "content-type": "application/json" },
        status: 200,
        statusText: "OK",
      }),
    );

    await expect($fetch(USER_URL, schema)).rejects.toThrow(ValidationError);
  });

  it("should return validation result when throwOnValidationError is false with Zod", async () => {
    const schema = z.object({
      email: z.email(),
      id: z.number(),
    });

    const invalidData = { email: INVALID_EMAIL_VALUE, id: 1 };

    fetchMock.mockResolvedValue(
      new Response(JSON.stringify(invalidData), {
        headers: { "content-type": "application/json" },
        status: 200,
        statusText: "OK",
      }),
    );

    const result = await $fetch(USER_URL, schema, {
      throwOnValidationError: false,
    });

    expect(Array.isArray(result.issues)).toBeTruthy();
  });

  it("should return successful validation result when data is valid and throwOnValidationError is false (Zod)", async () => {
    const schema = z.object({
      email: z.email(),
      id: z.number(),
    });

    const validData = { email: MOCK_EMAIL, id: 1 };

    fetchMock.mockResolvedValue(
      new Response(JSON.stringify(validData), {
        headers: { "content-type": "application/json" },
        status: 200,
        statusText: "OK",
      }),
    );

    const result = await $fetch(USER_URL, schema, {
      throwOnValidationError: false,
    });

    expect(validatedValue(result)).toStrictEqual(validData);
    expect(result.issues).toBeUndefined();
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

    fetchMock.mockResolvedValue(
      new Response(JSON.stringify(mockData), {
        headers: { "content-type": "application/json" },
        status: 200,
        statusText: "OK",
      }),
    );

    const result = await $fetch(USERS_URL, schema);

    expect(result).toStrictEqual(mockData);
  });

  it("should work with api.get using Zod", async () => {
    const schema = z.object({ success: z.boolean() });
    const mockData = { success: true };

    fetchMock.mockResolvedValue(
      new Response(JSON.stringify(mockData), {
        headers: { "content-type": "application/json" },
        status: 200,
        statusText: "OK",
      }),
    );

    const result = await api.get(STATUS_URL, schema);

    expect(result).toStrictEqual(mockData);
  });

  it("should work with api.post using Zod", async () => {
    const schema = z.object({ created: z.boolean(), id: z.number() });
    const mockData = { created: true, id: 123 };
    const body = { name: "New Item" };

    fetchMock.mockResolvedValue(
      new Response(JSON.stringify(mockData), {
        headers: { "content-type": "application/json" },
        status: 201,
        statusText: "Created",
      }),
    );

    const result = await api.post(ITEMS_URL, schema, {
      body: JSON.stringify(body),
    });

    expect(result).toStrictEqual(mockData);
  });
});

describe("logging", () => {
  let fetchMock: Mock<typeof fetch>;

  beforeEach(() => {
    fetchMock = vi.fn<typeof fetch>();
    globalThis.fetch = fetchMock;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("logs the outgoing request and a debug response on success", async () => {
    const logger = createRecordingLogger();
    const { $fetch: instanceFetch } = createFetch({ logger });
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 }));

    await instanceFetch(USERS_URL, { method: "POST" });

    expect(logger.calls).toStrictEqual([
      {
        context: { method: "POST", url: USERS_URL },
        level: "debug",
        message: "fetch request",
      },
      {
        context: {
          method: "POST",
          status: 200,
          url: USERS_URL,
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

    await instanceFetch(USERS_URL);

    expect(logger.calls).toStrictEqual([
      {
        context: { method: "GET", url: USERS_URL },
        level: "debug",
        message: "fetch request",
      },
      {
        context: {
          method: "GET",
          status: 500,
          url: USERS_URL,
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
      new Response(JSON.stringify({ id: NOT_A_NUMBER_VALUE }), { status: 200 }),
    );

    await expect(instanceFetch(USER_1_URL, schema)).rejects.toBeInstanceOf(ValidationError);

    const errorCall = logger.calls.find((call) => call.level === "error");
    expect(errorCall?.message).toBe("fetch validation failed");
    expect(errorCall?.context?.["url"]).toBe(USER_1_URL);
  });

  it("logs a validation failure at error when throwOnValidationError is false", async () => {
    const logger = createRecordingLogger();
    const { $fetch: instanceFetch } = createFetch({ logger });
    const schema = z.object({ id: z.number() });
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ id: NOT_A_NUMBER_VALUE }), { status: 200 }),
    );

    const result = await instanceFetch(USER_1_URL, schema, {
      throwOnValidationError: false,
    });

    expect(result.issues).toBeDefined();
    const errorCall = logger.calls.find((call) => call.level === "error");
    expect(errorCall?.message).toBe("fetch validation failed");
  });

  it("does not log anything when no logger is provided", async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ ok: true })));

    await expect($fetch(USERS_URL)).resolves.toBeInstanceOf(Response);
  });
});
