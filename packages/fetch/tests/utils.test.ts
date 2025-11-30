import { afterEach, beforeEach, describe, it, vi } from "vitest";

describe("mergeHeaders", () => {
  describe("when both arguments are undefined", () => {
    it.todo("should return undefined");
  });

  describe("when base is provided", () => {
    it.todo("should return Headers with base values");
    it.todo("should handle HeadersInit as object");
    it.todo("should handle HeadersInit as Headers instance");
    it.todo("should handle HeadersInit as array of tuples");
  });

  describe("when override is provided", () => {
    it.todo("should return Headers with override values");
    it.todo("should handle HeadersInit as object");
    it.todo("should handle HeadersInit as Headers instance");
  });

  describe("when both base and override are provided", () => {
    it.todo("should merge headers with override taking precedence");
    it.todo("should keep base headers not present in override");
    it.todo("should replace base headers present in override");
    it.todo("should add new headers from override");
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
    it.todo("should construct URL from baseURL and resource");
    it.todo("should handle baseURL with trailing slash");
    it.todo("should handle resource with leading slash");
    it.todo(
      "should handle both baseURL with trailing slash and resource with leading slash"
    );
    it.todo("should use resource as-is when no baseURL");
  });

  describe("headers merging", () => {
    it.todo("should merge default headers with request headers");
    it.todo("should allow request headers to override default headers");
    it.todo("should work with no headers");
  });

  describe("body handling", () => {
    it.todo("should stringify body when schema is provided");
    it.todo("should set Content-Type to application/json when schema and body");
    it.todo("should not override existing Content-Type header");
    it.todo("should not stringify body when no schema is provided");
  });

  describe("error handling", () => {
    it.todo(
      "should throw FetchError on non-ok response when throwOnFetchError is true"
    );
    it.todo(
      "should not throw on non-ok response when throwOnFetchError is false"
    );
    it.todo("should include status and statusText in FetchError message");
  });

  describe("response handling", () => {
    it.todo("should return raw Response when no schema is provided");
    it.todo("should parse JSON and validate when schema is provided");
    it.todo(
      "should return validated value when throwOnValidationError is true"
    );
    it.todo("should return result object when throwOnValidationError is false");
  });

  describe("defaults handling", () => {
    it.todo("should use throwOnValidationError from defaults");
    it.todo("should use throwOnFetchError from defaults");
    it.todo("should allow options to override defaults");
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
    it.todo("should return a function");
    it.todo("should create a method bound to the provided fetch function");
  });

  describe("method invocation", () => {
    it.todo("should call fetch with the specified HTTP method");
    it.todo("should pass resource to fetch");
    it.todo("should pass schema to fetch");
    it.todo("should merge options with method");
    it.todo("should not allow overriding method via options");
  });

  describe("different HTTP methods", () => {
    it.todo("should work with GET method");
    it.todo("should work with POST method");
    it.todo("should work with PUT method");
    it.todo("should work with PATCH method");
    it.todo("should work with DELETE method");
  });
});
