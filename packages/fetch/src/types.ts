/**
 * Public and internal type contracts for the fetch package.
 *
 * @module @zap-studio/fetch/types
 */

import type { Logger } from "@zap-studio/logger";
import type { ResultAsync } from "@zap-studio/monads";
import type { StandardSchemaV1, ValidationError } from "@zap-studio/validation";

import type { FetchError } from "./errors.ts";

/**
 * Accepted `fetch` input type (`string`, `URL`, or `Request`).
 *
 * @example
 * const input: FetchInput = "/users/1";
 * const withUrl: FetchInput = new URL("https://api.example.com/users/1");
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
export type ExtendedRequestInit = (RequestBodyInit | JsonBodyInit) & CustomRequestInit;

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
  /**
   * Optional logger for request/response internals. When omitted, nothing
   * is logged.
   *
   * Logs outgoing requests at `debug`, response status at `debug` (2xx) or
   * `warn` (non-2xx), and validation failures at `error`.
   */
  logger?: Logger;
}

/**
 * Type-safe fetch function with Standard Schema validation support
 *
 * @example
 * import { z } from "zod";
 *
 * const UserSchema = z.object({ id: z.number(), name: z.string() });
 * const fetchUser: $Fetch = $fetch;
 * const user = await fetchUser("/users/1", UserSchema);
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
   * @throws {unknown} Any error thrown or rejected by the provided Standard Schema validator.
   */
  <TSchema extends StandardSchemaV1>(
    input: FetchInput,
    schema: TSchema,
    options: ExtendedRequestInit & { throwOnValidationError: false },
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
   * @throws {unknown} Any error thrown or rejected by the provided Standard Schema validator.
   */
  <TSchema extends StandardSchemaV1>(
    input: FetchInput,
    schema: TSchema,
    options?: ExtendedRequestInit & {
      throwOnValidationError?: true;
    },
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
 * `ExtendedRequestInit` minus `throwOnFetchError`/`throwOnValidationError`,
 * which don't apply to the `Result`-returning API — it always returns a
 * `Result` instead of throwing.
 *
 * Built from `RequestBodyInit | JsonBodyInit` directly rather than
 * `Omit<ExtendedRequestInit, ...>`, since `Omit` doesn't distribute over that
 * union and would silently drop the `body`/`json` mutual exclusivity.
 *
 * @example
 * const options: FetchResultRequestInit = { method: "POST", json: { name: "Ada" } };
 */
export type FetchResultRequestInit = (RequestBodyInit | JsonBodyInit) &
  Omit<CustomRequestInit, "throwOnFetchError" | "throwOnValidationError">;

/**
 * `Result`-returning counterpart to {@link $Fetch}, for consumers who prefer
 * explicit `Result`/`ResultAsync` values (from `@zap-studio/monads`) over
 * throw/catch.
 *
 * @example
 * import { isOk } from "@zap-studio/monads";
 *
 * const UserSchema = z.object({ id: z.number(), name: z.string() });
 * const fetchUser: $FetchResult = $fetchResult;
 * const result = await fetchUser("/users/1", UserSchema);
 *
 * if (isOk(result)) {
 *   console.log(result.value);
 * }
 */
export interface $FetchResult {
  /**
   * Fetch with schema validation, returning a `Result`.
   * @param input - URL or path to fetch
   * @param schema - Standard Schema for response validation
   * @param options - Extended request options, minus the throw flags
   * @returns A `ResultAsync` resolving to `Ok` with the validated value, or `Err` with a
   *   `FetchError` (non-ok response) or `ValidationError` (validation issues).
   * @throws {TypeError} When request construction, JSON request serialization, headers,
   *   search params, native `fetch`, or `response.json()` body reading fail with a
   *   `TypeError`.
   * @throws {DOMException} When native `fetch` or `response.json()` rejects an aborted
   *   request/body read as an `AbortError` DOMException.
   * @throws {SyntaxError} When `response.json()` cannot parse the response body.
   * @throws {unknown} Any error thrown or rejected by the provided Standard Schema validator
   *   that isn't a `ValidationError`.
   */
  <TSchema extends StandardSchemaV1>(
    input: FetchInput,
    schema: TSchema,
    options?: FetchResultRequestInit,
  ): ResultAsync<StandardSchemaV1.InferOutput<TSchema>, FetchError | ValidationError>;

  /**
   * Fetch without schema validation, returning a `Result`.
   * @param input - URL or path to fetch
   * @param options - Extended request options, minus the throw flags
   * @returns A `ResultAsync` resolving to `Ok` with the raw `Response`, or `Err` with a
   *   `FetchError` on a non-ok response.
   * @throws {TypeError} When request construction, JSON request serialization, headers,
   *   search params, or native `fetch` fail with a `TypeError`.
   * @throws {DOMException} When native `fetch` rejects an aborted request as an
   *   `AbortError` DOMException.
   */
  (input: FetchInput, options?: FetchResultRequestInit): ResultAsync<Response, FetchError>;
}

/**
 * `Result`-returning counterpart to {@link ApiMethods}.
 *
 * @example
 * const result = await apiResult.get("/users/1", UserSchema);
 */
export interface ApiResultMethods {
  /** DELETE method, `Result`-returning */
  delete: $FetchResult;
  /** GET method, `Result`-returning */
  get: $FetchResult;
  /** PATCH method, `Result`-returning */
  patch: $FetchResult;
  /** POST method, `Result`-returning */
  post: $FetchResult;
  /** PUT method, `Result`-returning */
  put: $FetchResult;
}

/**
 * Normalized representation used by internal request execution.
 *
 * @example
 * const normalized: NormalizedRequest = {
 *   url: "https://api.example.com/users",
 *   options: {},
 * };
 */
export interface NormalizedRequest {
  /** Resolved string URL from the input (string or `URL`; `Request` uses `request.url`). */
  url: string;
  /** Original `Request` clone, present when the input was a `Request`. */
  request?: Request;
  /** Normalized request options merged with `Request` headers. */
  options: ExtendedRequestInit;
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

/**
 * Configured fetch instance returned by `createFetch(...)`.
 *
 * @example
 * const { $fetch, api } = createFetch({ baseURL: "https://api.example.com" });
 */
export interface FetchInstance {
  /**
   * Configured `$fetch` function.
   */
  $fetch: $Fetch;
  /**
   * Configured `Result`-returning `$fetch` function.
   */
  $fetchResult: $FetchResult;
  /**
   * Configured HTTP method-specific fetch functions.
   */
  api: ApiMethods;
  /**
   * Configured HTTP method-specific `Result`-returning fetch functions.
   */
  apiResult: ApiResultMethods;
}
