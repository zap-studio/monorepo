import { afterEach, beforeEach, describe, it, vi } from "vitest";

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
    it.todo("should make a fetch request to the given URL");
    it.todo("should return raw Response when no schema is provided");
    it.todo("should pass RequestInit options to fetch");
    it.todo("should support all HTTP methods via options.method");
  });

  describe("schema validation", () => {
    it.todo("should validate response data against the provided schema");
    it.todo("should return validated data when schema validation passes");
    it.todo(
      "should throw ValidationError when validation fails and throwOnValidationError is true (default)"
    );
    it.todo(
      "should return result object with issues when validation fails and throwOnValidationError is false"
    );
    it.todo(
      "should return result object with value when validation passes and throwOnValidationError is false"
    );
    it.todo("should parse response as JSON when schema is provided");
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
