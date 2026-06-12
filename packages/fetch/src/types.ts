/**
 * Public and internal type contracts for the fetch package.
 *
 * @module @zap-studio/fetch/types
 */

import type { StandardSchemaV1 } from "@zap-studio/validation";

/**
 * Accepted `fetch` input type (`string`, `URL`, or `Request`).
 */
export type FetchInput = Parameters<typeof fetch>[0];

type URLSearchParamsInput = ConstructorParameters<typeof URLSearchParams>[0];

type RequestBodyInit = RequestInit & {
  json?: never;
};

type JsonBodyInit = Omit<RequestInit, "body"> & {
  /**
   * JSON body convenience. When provided, this is JSON-stringified into `body`.
   * @default undefined
   */
  json: unknown;
  body?: never;
};

interface CustomRequestInit {
  /**
   * Per-request query/search params
   * @default undefined
   */
  searchParams?: URLSearchParamsInput;
  /**
   * Whether to throw a FetchError on HTTP errors (non-2xx responses)
   * @default true
   */
  throwOnFetchError?: boolean;
  /**
   * Whether to throw a ValidationError on validation errors
   * @default true
   */
  throwOnValidationError?: boolean;
}

/**
 * Extended RequestInit type to include custom fetch options
 *
 * @example
 * const options: ExtendedRequestInit = {
 *   method: "POST",
 *   json: { name: "Ada" },
 *   throwOnFetchError: true,
 * };
 */
export type ExtendedRequestInit = (RequestBodyInit | JsonBodyInit) &
  CustomRequestInit;

/**
 * Internal defaults used by fetchInternal
 *
 * @example
 * const defaults: FetchDefaults = {
 *   baseURL: "https://api.example.com",
 *   throwOnFetchError: true,
 *   throwOnValidationError: true,
 * };
 */
export interface FetchDefaults {
  /**
   * Base URL to prepend to all requests
   * @default ""
   */
  baseURL: string;
  /**
   * Default headers to include in all requests (can be overridden per request)
   * @default undefined
   */
  headers?: HeadersInit;
  /**
   * Default query/search params applied to every request (can be overridden per request)
   * @default undefined
   */
  searchParams?: URLSearchParamsInput;
  /**
   * Whether to throw a `FetchError` on HTTP errors (non-2xx responses)
   * @default true
   */
  throwOnFetchError: boolean;
  /**
   * Whether to throw a `ValidationError` on validation errors
   * @default true
   */
  throwOnValidationError: boolean;
}

/**
 * Type-safe fetch function with Standard Schema validation support
 */
export interface $Fetch {
  /**
   * Fetch with schema validation and throwOnValidationError: false
   * @param input - URL or path to fetch
   * @param schema - Standard Schema for response validation
   * @param options - Extended request options with throwOnValidationError: false
   * @returns Standard Schema Result object with value or issues
   * @throws {FetchError} When `throwOnFetchError` is `true` and the response is not ok.
   * @throws {TypeError} When request construction, JSON request serialization, headers,
   *   search params, native `fetch`, or `response.json()` body reading fail with a
   *   `TypeError`.
   * @throws {DOMException} When native `fetch` or `response.json()` rejects an aborted
   *   request/body read as an `AbortError` DOMException.
   * @throws {SyntaxError} When `response.json()` cannot parse the response body.
   * @throws Any error thrown or rejected by the provided Standard Schema validator.
   */
  <TSchema extends StandardSchemaV1>(
    input: FetchInput,
    schema: TSchema,
    options: ExtendedRequestInit & { throwOnValidationError: false }
  ): Promise<StandardSchemaV1.Result<StandardSchemaV1.InferOutput<TSchema>>>;

  /**
   * Fetch with schema validation and throwOnValidationError: true or undefined (default)
   * @param input - URL or path to fetch
   * @param schema - Standard Schema for response validation
   * @param options - Extended request options
   * @returns Validated data of type TSchema
   * @throws {FetchError} When `throwOnFetchError` is `true` and the response is not ok.
   * @throws {ValidationError} When validation returns issues.
   * @throws {TypeError} When request construction, JSON request serialization, headers,
   *   search params, native `fetch`, or `response.json()` body reading fail with a
   *   `TypeError`.
   * @throws {DOMException} When native `fetch` or `response.json()` rejects an aborted
   *   request/body read as an `AbortError` DOMException.
   * @throws {SyntaxError} When `response.json()` cannot parse the response body.
   * @throws Any error thrown or rejected by the provided Standard Schema validator.
   */
  <TSchema extends StandardSchemaV1>(
    input: FetchInput,
    schema: TSchema,
    options?: ExtendedRequestInit & {
      throwOnValidationError?: true;
    }
  ): Promise<StandardSchemaV1.InferOutput<TSchema>>;

  /**
   * Fetch without schema validation
   * @param input - URL or path to fetch
   * @param options - Extended request options
   * @returns Raw Response object
   * @throws {FetchError} When `throwOnFetchError` is `true` and the response is not ok.
   * @throws {TypeError} When request construction, JSON request serialization, headers,
   *   search params, or native `fetch` fail with a `TypeError`.
   * @throws {DOMException} When native `fetch` rejects an aborted request as an
   *   `AbortError` DOMException.
   */
  (input: FetchInput, options?: ExtendedRequestInit): Promise<Response>;
}

/**
 * API HTTP method-specific fetch functions
 *
 * @example
 * const user = await api.get("/users/1", UserSchema);
 */
export interface ApiMethods {
  /**
   * DELETE method fetch function
   */
  delete: $Fetch;
  /**
   * GET method fetch function
   */
  get: $Fetch;
  /**
   * PATCH method fetch function
   */
  patch: $Fetch;
  /**
   * POST method fetch function
   */
  post: $Fetch;
  /**
   * PUT method fetch function
   */
  put: $Fetch;
}
