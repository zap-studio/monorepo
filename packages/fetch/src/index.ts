/**
 * Public entrypoint for the fetch package.
 *
 * Exports `$fetch`, `api`, `createFetch`, `FetchError`, `GLOBAL_DEFAULTS`,
 * and the public type contracts. `FetchError` and the type contracts are
 * also available from dedicated subpaths (`@zap-studio/fetch/errors`,
 * `@zap-studio/fetch/types`) for consumers who prefer granular imports. All
 * exports are side-effect free and tree-shakeable.
 *
 * @module @zap-studio/fetch
 */

import type { Logger } from "@zap-studio/logger";
import type { Result } from "@zap-studio/monads";
import type { StandardSchemaV1 } from "@zap-studio/validation";

import {
  SpanKind,
  SpanStatusCode,
  context as otelContext,
  propagation,
  trace,
} from "@opentelemetry/api";
import { err, ok, ResultAsync } from "@zap-studio/monads";
import { isStandardSchema, standardValidate, ValidationError } from "@zap-studio/validation";

import type {
  $Fetch,
  $FetchResult,
  ApiMethods,
  ApiResultMethods,
  ExtendedRequestInit,
  FetchDefaults,
  FetchInput,
  FetchInstance,
  FetchResultRequestInit,
  NormalizedRequest,
} from "./types.ts";

import { HEADERS_SETTER, recordSpanError, tracer } from "./_otel.ts";
import { FetchError } from "./errors.ts";

export { FetchError } from "./errors.ts";
export type {
  $Fetch,
  $FetchResult,
  ApiMethods,
  ApiResultMethods,
  ExtendedRequestInit,
  FetchDefaults,
  FetchInput,
  FetchInstance,
  FetchResultRequestInit,
  NormalizedRequest,
} from "./types.ts";

/**
 * Default options for the global $fetch
 *
 * These defaults are used by the top-level `$fetch` export.
 * Use `createFetch(...)` when you need per-client defaults.
 *
 * @example
 * import { GLOBAL_DEFAULTS } from "@zap-studio/fetch";
 *
 * console.log(GLOBAL_DEFAULTS.throwOnFetchError); // true
 */
export const GLOBAL_DEFAULTS: FetchDefaults = {
  baseURL: "",
  throwOnFetchError: true,
  throwOnValidationError: true,
};

/**
 * Merges two HeadersInit objects, with the second one taking precedence.
 *
 * @param base - Base/default headers.
 * @param override - Request-level override headers.
 * @returns A merged `Headers` object, or `undefined` when both inputs are empty.
 * @throws {TypeError} When either header input contains invalid header names or values.
 */
const mergeHeaders = (base?: HeadersInit, override?: HeadersInit): Headers | undefined => {
  if (base === undefined && override === undefined) {
    return undefined;
  }

  const merged = new Headers(base);
  for (const [key, value] of new Headers(override).entries()) {
    merged.set(key, value);
  }
  return merged;
};

// SAFETY: Every property of `ExtendedRequestInit` is optional, so `{}` is already a structurally valid value; the cast only pins the type.
const EMPTY_OPTIONS = {} as ExtendedRequestInit;

/**
 * Normalizes fetch `input` and request-level options into a consistent internal shape.
 *
 * @param input - Request URL/path or Request instance.
 * @param options - Optional request options.
 * @returns A normalized request structure for internal processing.
 * @throws {TypeError} When cloning a `Request` fails or the merged headers are invalid.
 */
const normalizeRequest = (input: FetchInput, options?: ExtendedRequestInit): NormalizedRequest => {
  if (!(input instanceof Request)) {
    const url = input instanceof URL ? input.href : input;
    return {
      options: options ?? EMPTY_OPTIONS,
      url,
    };
  }

  const request = new Request(input);
  const { headers, ...rest } = options ?? {};
  const mergedHeaders = mergeHeaders(request.headers, headers);
  // SAFETY: `rest` is `options` with only the `headers` key removed, so it's already structurally an `ExtendedRequestInit` minus `headers`, which is set below.
  const normalizedOptions = { ...rest } as ExtendedRequestInit;

  if (mergedHeaders !== undefined) {
    normalizedOptions.headers = mergedHeaders;
  }

  return {
    options: normalizedOptions,
    request,
    url: request.url,
  };
};

/**
 * Copies search params into target, overriding duplicate keys.
 */
const mergeSearchParams = (
  target: URLSearchParams,
  source: ExtendedRequestInit["searchParams"] | undefined,
): void => {
  for (const [key, value] of new URLSearchParams(source)) {
    target.set(key, value);
  }
};

/**
 * Ensures a URL has a trailing slash for relative URL resolution.
 */
const ensureTrailingSlash = (url: string): string => (url.endsWith("/") ? url : `${url}/`);

/**
 * Resolves search params by applying default params, URL params, then request params.
 */
const resolveSearchParams = (
  url: string,
  defaultSearchParams: FetchDefaults["searchParams"] | undefined,
  searchParams: ExtendedRequestInit["searchParams"] | undefined,
): string => {
  if (defaultSearchParams === undefined && searchParams === undefined) {
    return url;
  }

  const hashIndex = url.indexOf("#");
  const hasFragment = hashIndex !== -1;
  const urlWithoutHash = hasFragment ? url.slice(0, hashIndex) : url;
  const hash = hasFragment ? url.slice(hashIndex + 1) : "";
  const queryIndex = urlWithoutHash.indexOf("?");
  const pathname = queryIndex === -1 ? urlWithoutHash : urlWithoutHash.slice(0, queryIndex);
  const urlSearchParams = queryIndex === -1 ? undefined : urlWithoutHash.slice(queryIndex + 1);
  const resolvedSearchParams = new URLSearchParams();

  mergeSearchParams(resolvedSearchParams, defaultSearchParams);
  mergeSearchParams(resolvedSearchParams, urlSearchParams);
  mergeSearchParams(resolvedSearchParams, searchParams);

  const resolvedSearch = resolvedSearchParams.toString();
  const fragmentSuffix = hasFragment ? `#${hash}` : "";

  if (resolvedSearch.length === 0) {
    return `${pathname}${fragmentSuffix}`;
  }

  return `${pathname}?${resolvedSearch}${fragmentSuffix}`;
};

/**
 * Resolves final request URL by applying baseURL and layered search params.
 *
 * Search param precedence:
 * 1. `defaults.searchParams`
 * 2. search params already present in `resourceUrl`
 * 3. per-request `searchParams`
 *
 * @throws {TypeError} When `baseURL` and `resourceUrl` cannot be resolved by
 *   `URL`, or when default/per-request search params cannot be converted by
 *   `URLSearchParams`.
 */
const resolveRequestUrl = (
  resourceUrl: string,
  defaults: FetchDefaults,
  searchParams?: ExtendedRequestInit["searchParams"],
): string => {
  const url = defaults.baseURL
    ? new URL(resourceUrl, ensureTrailingSlash(defaults.baseURL)).toString()
    : resourceUrl;

  return resolveSearchParams(url, defaults.searchParams, searchParams);
};

/**
 * Normalizes request-level options into a final RequestInit payload and runtime flags.
 *
 * @param options - Request-level options.
 * @param defaults - Client-level defaults.
 * @returns Fully merged request init payload and effective runtime flags.
 */
const prepareRequestInit = (options: ExtendedRequestInit, defaults: FetchDefaults) => {
  const {
    headers,
    json,
    searchParams,
    throwOnFetchError = defaults.throwOnFetchError,
    throwOnValidationError = defaults.throwOnValidationError,
    ...rest
  } = options;

  const init: RequestInit = { ...rest };
  const mergedHeaders = mergeHeaders(defaults.headers, headers);
  if (mergedHeaders !== undefined) {
    init.headers = mergedHeaders;
  }

  if (json !== undefined) {
    if (init.body !== undefined && init.body !== null) {
      throw new TypeError("Cannot provide both `body` and `json`.");
    }

    init.body = JSON.stringify(json);
    const requestHeaders = new Headers(init.headers);
    if (!requestHeaders.has("Content-Type")) {
      requestHeaders.set("Content-Type", "application/json");
    }
    init.headers = requestHeaders;
  }

  return {
    init,
    searchParams,
    throwOnFetchError,
    throwOnValidationError,
  };
};

/**
 * Logs a fetch response: `debug` for 2xx, `warn` otherwise.
 */
const logResponse = (
  logger: Logger | undefined,
  method: string,
  url: string,
  response: Response,
): void => {
  const context = { method, status: response.status, url };
  if (response.ok) {
    logger?.debug("fetch response", context);
  } else {
    logger?.warn("fetch response", context);
  }
};

/**
 * Validates the raw JSON payload against `schema`, logging a `fetch
 * validation failed` message at `error` on failure regardless of throw mode.
 *
 * @throws {unknown} Any error thrown by `standardValidate` in throw mode.
 */
const validateResponse = async (
  raw: unknown,
  schema: StandardSchemaV1,
  throwOnValidationError: boolean,
  logger: Logger | undefined,
  url: string,
): Promise<unknown> => {
  if (throwOnValidationError) {
    try {
      return await standardValidate(raw, schema, { throwOnError: true });
    } catch (error) {
      logger?.error("fetch validation failed", { error, url });
      throw error;
    }
  }

  const result = await standardValidate(raw, schema, { throwOnError: false });
  if (result.issues) {
    logger?.error("fetch validation failed", { issues: result.issues, url });
  }
  return result;
};

/**
 * Internal fetch implementation used by both $fetch and createFetch.
 *
 * This function normalizes request input, resolves final URL + query params,
 * executes `fetch`, optionally throws `FetchError`, and optionally validates
 * JSON response payloads using Standard Schema.
 *
 * @param input - Request URL, path, or Request object.
 * @param schema - Optional Standard Schema for response validation.
 * @param options - Optional request options and package-specific flags.
 * @param defaults - Effective client defaults.
 * @returns Raw `Response` when no schema is provided; otherwise validated output.
 * @throws {FetchError} When `throwOnFetchError` is `true` and the response is not ok.
 * @throws {ValidationError} When a schema is provided, validation returns issues, and
 *   `throwOnValidationError` is `true`.
 * @throws {TypeError} When both `body` and `json` are provided, when JSON request
 *   serialization fails, when request construction fails, when headers/search params are
 *   invalid, when `response.json()` cannot read the body, or when the runtime `fetch`
 *   implementation rejects network-level failures as `TypeError`.
 * @throws {DOMException} When the runtime rejects an aborted request or response body read
 *   as an `AbortError` DOMException.
 * @throws {SyntaxError} When a schema is provided and `response.json()` cannot parse the
 *   response body.
 * @throws {unknown} Any error thrown or rejected by the provided Standard Schema validator.
 */
const fetchInternal = async (
  input: FetchInput,
  schema: StandardSchemaV1 | undefined,
  options: ExtendedRequestInit | undefined,
  defaults: FetchDefaults,
): Promise<unknown> => {
  const { logger } = defaults;
  const request = normalizeRequest(input, options);
  const { init, searchParams, throwOnFetchError, throwOnValidationError } = prepareRequestInit(
    request.options,
    defaults,
  );
  const url = resolveRequestUrl(request.url, defaults, searchParams);
  const method = init.method ?? "GET";

  logger?.debug("fetch request", { method, url });

  const span = tracer.startSpan(method, {
    attributes: {
      "http.request.method": method,
      "url.full": url,
    },
    kind: SpanKind.CLIENT,
  });
  const spanContext = trace.setSpan(otelContext.active(), span);

  try {
    return await otelContext.with(spanContext, async () => {
      const headers = new Headers(init.headers);
      propagation.inject(spanContext, headers, HEADERS_SETTER);
      init.headers = headers;

      const response = request.request
        ? await fetch(new Request(url, request.request), init)
        : await fetch(url, init);

      logResponse(logger, method, url, response);
      span.setAttribute("http.response.status_code", response.status);
      if (!response.ok) {
        span.setStatus({ code: SpanStatusCode.ERROR });
      }

      if (throwOnFetchError && !response.ok) {
        throw new FetchError(`HTTP ${response.status}: ${response.statusText}`, response);
      }

      if (schema === undefined) {
        return response;
      }

      const raw: unknown = await response.json();
      return await validateResponse(raw, schema, throwOnValidationError, logger, url);
    });
  } catch (error) {
    recordSpanError(span, error);
    throw error;
  } finally {
    span.end();
  }
};

/**
 * Runs `fetchInternal` with both throw flags forced to `true`, converting a
 * thrown `FetchError`/`ValidationError` into `Err` instead of rethrowing.
 *
 * Any other thrown value (malformed input, a `TypeError`/`DOMException`/
 * `SyntaxError`, or an unknown validator throw) is a programmer error, not a
 * value a caller should branch on, and propagates unchanged.
 *
 * @throws {unknown} Any error thrown or rejected by `fetchInternal` that isn't a
 *   `FetchError` or `ValidationError`.
 */
const fetchInternalResult = async (
  input: FetchInput,
  schema: StandardSchemaV1 | undefined,
  options: FetchResultRequestInit | undefined,
  defaults: FetchDefaults,
): Promise<Result<unknown, FetchError | ValidationError>> => {
  try {
    // SAFETY: `options` is `FetchResultRequestInit`, i.e. `ExtendedRequestInit` minus the two throw flags set explicitly below, so this spread is already structurally a valid `ExtendedRequestInit`.
    const requestInit = {
      ...options,
      throwOnFetchError: true,
      throwOnValidationError: true,
    } as ExtendedRequestInit;
    const value = await fetchInternal(input, schema, requestInit, defaults);
    return ok(value);
  } catch (error) {
    if (error instanceof FetchError || error instanceof ValidationError) {
      return err(error);
    }

    throw error;
  }
};

/**
 * Creates an HTTP method helper bound to a `Result`-returning fetch function.
 *
 * The returned function mirrors `$FetchResult`'s overloads but forces the
 * provided HTTP method (`GET`, `POST`, etc.) into request options.
 *
 * @param fetchFn - `Result`-returning fetch function to wrap.
 * @param method - HTTP method to enforce.
 * @returns Method-bound `Result`-returning fetch function.
 *
 * @example
 * const get = createMethodResult($fetchResult, "GET");
 * const result = await get("/users/1", UserSchema);
 */
const createMethodResult = (fetchFn: $FetchResult, method: string): $FetchResult => {
  function methodFetch<TSchema extends StandardSchemaV1>(
    input: FetchInput,
    schema: TSchema,
    options?: FetchResultRequestInit,
  ): ResultAsync<StandardSchemaV1.InferOutput<TSchema>, FetchError | ValidationError>;

  function methodFetch(
    input: FetchInput,
    options?: FetchResultRequestInit,
  ): ResultAsync<Response, FetchError>;

  /**
   * Method-bound `$FetchResult` implementation.
   *
   * Resolves the schema/options overload and injects the configured HTTP method.
   */
  function methodFetch(
    input: FetchInput,
    schemaOrOptions?: StandardSchemaV1 | FetchResultRequestInit,
    optionsOrUndefined?: FetchResultRequestInit,
  ): ResultAsync<unknown, FetchError | ValidationError> {
    if (isStandardSchema(schemaOrOptions)) {
      return fetchFn(input, schemaOrOptions, { ...optionsOrUndefined, method });
    }

    return fetchFn(input, { ...schemaOrOptions, method });
  }

  return methodFetch;
};

/**
 * Creates an HTTP method helper bound to a fetch function.
 *
 * The returned function mirrors `$Fetch` overloads but forces the provided
 * HTTP method (`GET`, `POST`, etc.) into request options.
 *
 * @param fetchFn - Fetch function to wrap.
 * @param method - HTTP method to enforce.
 * @returns Method-bound fetch function.
 * @throws {unknown} Any error thrown or rejected by `fetchFn` when the returned method-bound
 *   fetch function is called.
 *
 * @example
 * const get = createMethod($fetch, "GET");
 * const user = await get("/users/1", UserSchema);
 */
const createMethod = (fetchFn: $Fetch, method: string): $Fetch => {
  function methodFetch<TSchema extends StandardSchemaV1>(
    input: FetchInput,
    schema: TSchema,
    options: ExtendedRequestInit & {
      throwOnValidationError: false;
    },
  ): Promise<StandardSchemaV1.Result<StandardSchemaV1.InferOutput<TSchema>>>;

  function methodFetch<TSchema extends StandardSchemaV1>(
    input: FetchInput,
    schema: TSchema,
    options?: ExtendedRequestInit & {
      throwOnValidationError?: true;
    },
  ): Promise<StandardSchemaV1.InferOutput<TSchema>>;

  function methodFetch(input: FetchInput, options?: ExtendedRequestInit): Promise<Response>;

  /**
   * Method-bound `$Fetch` implementation.
   *
   * Resolves schema/option overloads and injects the configured HTTP method.
   */
  async function methodFetch(
    input: FetchInput,
    schemaOrOptions?: StandardSchemaV1 | ExtendedRequestInit,
    optionsOrUndefined?: ExtendedRequestInit,
  ): Promise<unknown> {
    if (isStandardSchema(schemaOrOptions)) {
      if (optionsOrUndefined?.throwOnValidationError === false) {
        return await fetchFn(input, schemaOrOptions, {
          ...optionsOrUndefined,
          method,
          throwOnValidationError: false,
        });
      }

      const { throwOnValidationError, ...restOptions } = optionsOrUndefined ?? {};

      if (throwOnValidationError === true) {
        return await fetchFn(input, schemaOrOptions, {
          ...restOptions,
          method,
          throwOnValidationError: true,
        });
      }

      return await fetchFn(input, schemaOrOptions, {
        ...restOptions,
        method,
      });
    }

    return await fetchFn(input, {
      ...schemaOrOptions,
      method,
    });
  }

  return methodFetch;
};

/**
 * Type-safe fetch wrapper with Standard Schema validation.
 *
 * - When `throwOnValidationError: true`: validated data of type `TSchema`
 * - When `throwOnValidationError: false`: Standard Schema Result object `{ value?, issues? }`
 * - When `throwOnFetchError: true`: throws `FetchError` on non-ok responses
 *
 * If no schema is provided, returns the raw `Response` object.
 *
 * @throws {FetchError} When `throwOnFetchError` is `true` and the response is not ok.
 * @throws {ValidationError} When a schema is provided, validation returns issues, and
 *   `throwOnValidationError` is `true`.
 * @throws {TypeError} When both `body` and `json` are provided, when JSON request
 *   serialization fails, when request construction fails, when headers/search params are
 *   invalid, when `response.json()` cannot read the body, or when the runtime `fetch`
 *   implementation rejects network-level failures as `TypeError`.
 * @throws {DOMException} When the runtime rejects an aborted request or response body read
 *   as an `AbortError` DOMException.
 * @throws {SyntaxError} When a schema is provided and `response.json()` cannot parse the
 *   response body.
 * @throws {unknown} Any error thrown or rejected by the provided Standard Schema validator.
 *
 * @example
 * import { z } from "zod";
 * import { $fetch } from "@zap-studio/fetch";
 *
 * const UserSchema = z.object({ id: z.number(), name: z.string() });
 *
 * // Basic usage (schema validation)
 * const user = await $fetch("/api/users/1", UserSchema, { headers: { "Authorization": "Bearer token" } });
 * console.log("Validated user:", user);
 *
 * // Raw usage (no schema validation and typed Response object)
 * const result = await $fetch("/api/data", { method: "POST", body: JSON.stringify({ key: "value" }) });
 * const json = await result.json() as ResultType;
 * console.log("Raw response data:", json);
 *
 * // Usage with validation errors returned instead of thrown
 * const result = await $fetch("/api/users/1", UserSchema, { throwOnValidationError: false });
 *
 * if (result.issues) {
 *   console.error("Validation errors:", result.issues);
 * } else {
 *   console.log("Validated user:", result.value);
 * }
 */
export async function $fetch<TSchema extends StandardSchemaV1>(
  input: FetchInput,
  schema: TSchema,
  options: ExtendedRequestInit & { throwOnValidationError: false },
): Promise<StandardSchemaV1.Result<StandardSchemaV1.InferOutput<TSchema>>>;

export async function $fetch<TSchema extends StandardSchemaV1>(
  input: FetchInput,
  schema: TSchema,
  options?: ExtendedRequestInit & { throwOnValidationError?: true },
): Promise<StandardSchemaV1.InferOutput<TSchema>>;

export async function $fetch(input: FetchInput, options?: ExtendedRequestInit): Promise<Response>;

export async function $fetch(
  input: FetchInput,
  schemaOrOptions?: StandardSchemaV1 | ExtendedRequestInit,
  optionsOrUndefined?: ExtendedRequestInit,
): Promise<unknown> {
  const [schema, options] = isStandardSchema(schemaOrOptions)
    ? [schemaOrOptions, optionsOrUndefined]
    : [undefined, schemaOrOptions];

  return await fetchInternal(input, schema, options, GLOBAL_DEFAULTS);
}

/**
 * `Result`-returning counterpart to {@link $fetch}, for consumers who prefer
 * explicit `Result`/`ResultAsync` values (from `@zap-studio/monads`) over
 * throw/catch.
 *
 * There's no `throwOnFetchError`/`throwOnValidationError` option — this
 * function always returns a `Result`, so the flags don't apply. A non-ok
 * response and validation issues both become `Err`; a malformed schema or
 * request still throws, since that's a programmer error, not a value to
 * branch on.
 *
 * If no schema is provided, resolves to `Ok` with the raw `Response` object
 * (still `Err(FetchError)` on a non-ok response).
 *
 * @throws {TypeError} When both `body` and `json` are provided, when JSON request
 *   serialization fails, when request construction fails, when headers/search params are
 *   invalid, when `response.json()` cannot read the body, or when the runtime `fetch`
 *   implementation rejects network-level failures as `TypeError`.
 * @throws {DOMException} When the runtime rejects an aborted request or response body read
 *   as an `AbortError` DOMException.
 * @throws {SyntaxError} When a schema is provided and `response.json()` cannot parse the
 *   response body.
 * @throws {unknown} Any error thrown or rejected by the provided Standard Schema validator
 *   that isn't a `ValidationError`.
 *
 * @example
 * ```ts
 * import { isOk } from "@zap-studio/monads";
 * import { $fetchResult } from "@zap-studio/fetch";
 * import { z } from "zod";
 *
 * const UserSchema = z.object({ id: z.number(), name: z.string() });
 *
 * const result = await $fetchResult("/api/users/1", UserSchema);
 *
 * if (isOk(result)) {
 *   console.log("Validated user:", result.value);
 * } else {
 *   console.error("Failed:", result.error);
 * }
 * ```
 */
export function $fetchResult<TSchema extends StandardSchemaV1>(
  input: FetchInput,
  schema: TSchema,
  options?: FetchResultRequestInit,
): ResultAsync<StandardSchemaV1.InferOutput<TSchema>, FetchError | ValidationError>;

export function $fetchResult(
  input: FetchInput,
  options?: FetchResultRequestInit,
): ResultAsync<Response, FetchError>;

export function $fetchResult(
  input: FetchInput,
  schemaOrOptions?: StandardSchemaV1 | FetchResultRequestInit,
  optionsOrUndefined?: FetchResultRequestInit,
): ResultAsync<unknown, FetchError | ValidationError> {
  const [schema, options] = isStandardSchema(schemaOrOptions)
    ? [schemaOrOptions, optionsOrUndefined]
    : [undefined, schemaOrOptions];

  return new ResultAsync(fetchInternalResult(input, schema, options, GLOBAL_DEFAULTS));
}

/**
 * Convenience methods for common HTTP verbs.
 *
 * These methods always require a schema for validation.
 * For raw responses without validation, use `$fetch` directly.
 *
 * Each method has the same throw behavior as {@link $fetch}.
 *
 * @example
 * import { z } from "zod";
 * import { api } from "@zap-studio/fetch";
 *
 * const PostSchema = z.object({
 *   id: z.number(),
 *   title: z.string(),
 *   content: z.string(),
 * });
 *
 * async function fetchPost(postId: number) {
 *   const post = await api.get(`https://api.example.com/posts/${postId}`, PostSchema);
 *   return post; // post is typed as { id: number; title: string; content: string; }
 * }
 */
export const api: ApiMethods = {
  delete: createMethod($fetch, "DELETE"),
  get: createMethod($fetch, "GET"),
  patch: createMethod($fetch, "PATCH"),
  post: createMethod($fetch, "POST"),
  put: createMethod($fetch, "PUT"),
};

/**
 * `Result`-returning counterpart to {@link api}.
 *
 * @example
 * import { z } from "zod";
 * import { apiResult } from "@zap-studio/fetch";
 *
 * const PostSchema = z.object({
 *   id: z.number(),
 *   title: z.string(),
 *   content: z.string(),
 * });
 *
 * const result = await apiResult.get(`https://api.example.com/posts/1`, PostSchema);
 */
export const apiResult: ApiResultMethods = {
  delete: createMethodResult($fetchResult, "DELETE"),
  get: createMethodResult($fetchResult, "GET"),
  patch: createMethodResult($fetchResult, "PATCH"),
  post: createMethodResult($fetchResult, "POST"),
  put: createMethodResult($fetchResult, "PUT"),
};

/**
 * Creates a custom fetch instance with pre-configured defaults.
 *
 * Use this factory to create API clients with a base URL, default headers,
 * and other shared configuration. Each instance is independent.
 *
 * The returned `$fetch` and `api` methods have the same throw behavior as the
 * top-level {@link $fetch} export.
 *
 * @example
 * import { z } from "zod";
 * import { createFetch } from "@zap-studio/fetch";
 *
 * // Create a configured instance
 * const { $fetch, api } = createFetch({
 *   baseURL: "https://api.example.com",
 *   headers: { "Authorization": "Bearer token" },
 * });
 *
 * const UserSchema = z.object({ id: z.number(), name: z.string() });
 *
 * // Now use relative paths - baseURL is prepended automatically
 * const user = await api.get("/users/1", UserSchema);
 *
 * // Or use $fetch directly
 * const response = await $fetch("/users", UserSchema, { method: "POST", json: { name: "John" } });
 */
export const createFetch = (factoryOptions: Partial<FetchDefaults> = {}): FetchInstance => {
  const defaults: FetchDefaults = {
    ...GLOBAL_DEFAULTS,
    ...factoryOptions,
    baseURL: factoryOptions.baseURL ?? GLOBAL_DEFAULTS.baseURL,
    throwOnFetchError: factoryOptions.throwOnFetchError ?? GLOBAL_DEFAULTS.throwOnFetchError,
    throwOnValidationError:
      factoryOptions.throwOnValidationError ?? GLOBAL_DEFAULTS.throwOnValidationError,
  };

  async function customFetch<TSchema extends StandardSchemaV1>(
    input: FetchInput,
    schema: TSchema,
    options: ExtendedRequestInit & { throwOnValidationError: false },
  ): Promise<StandardSchemaV1.Result<StandardSchemaV1.InferOutput<TSchema>>>;

  async function customFetch<TSchema extends StandardSchemaV1>(
    input: FetchInput,
    schema: TSchema,
    options?: ExtendedRequestInit & {
      throwOnValidationError?: true;
    },
  ): Promise<StandardSchemaV1.InferOutput<TSchema>>;

  async function customFetch(input: FetchInput, options?: ExtendedRequestInit): Promise<Response>;

  async function customFetch(
    input: FetchInput,
    schemaOrOptions?: StandardSchemaV1 | ExtendedRequestInit,
    optionsOrUndefined?: ExtendedRequestInit,
  ): Promise<unknown> {
    const [schema, options] = isStandardSchema(schemaOrOptions)
      ? [schemaOrOptions, optionsOrUndefined]
      : [undefined, schemaOrOptions];

    return await fetchInternal(input, schema, options, defaults);
  }

  const customApi = {
    delete: createMethod(customFetch, "DELETE"),
    get: createMethod(customFetch, "GET"),
    patch: createMethod(customFetch, "PATCH"),
    post: createMethod(customFetch, "POST"),
    put: createMethod(customFetch, "PUT"),
  };

  function customFetchResult<TSchema extends StandardSchemaV1>(
    input: FetchInput,
    schema: TSchema,
    options?: FetchResultRequestInit,
  ): ResultAsync<StandardSchemaV1.InferOutput<TSchema>, FetchError | ValidationError>;

  function customFetchResult(
    input: FetchInput,
    options?: FetchResultRequestInit,
  ): ResultAsync<Response, FetchError>;

  function customFetchResult(
    input: FetchInput,
    schemaOrOptions?: StandardSchemaV1 | FetchResultRequestInit,
    optionsOrUndefined?: FetchResultRequestInit,
  ): ResultAsync<unknown, FetchError | ValidationError> {
    const [schema, options] = isStandardSchema(schemaOrOptions)
      ? [schemaOrOptions, optionsOrUndefined]
      : [undefined, schemaOrOptions];

    return new ResultAsync(fetchInternalResult(input, schema, options, defaults));
  }

  const customApiResult: ApiResultMethods = {
    delete: createMethodResult(customFetchResult, "DELETE"),
    get: createMethodResult(customFetchResult, "GET"),
    patch: createMethodResult(customFetchResult, "PATCH"),
    post: createMethodResult(customFetchResult, "POST"),
    put: createMethodResult(customFetchResult, "PUT"),
  };

  return {
    $fetch: customFetch,
    $fetchResult: customFetchResult,
    api: customApi,
    apiResult: customApiResult,
  };
};
