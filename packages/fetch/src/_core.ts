/**
 * Internal request pipeline: defaults, header/URL/input normalization, and
 * request execution.
 *
 * @module @zap-studio/fetch (internal: _core)
 */

import { isStandardSchema, standardValidate } from "@zap-studio/validation";
import type { StandardSchemaV1 } from "@zap-studio/validation";

import { FetchError } from "./errors.js";
import type {
  $Fetch,
  ExtendedRequestInit,
  FetchDefaults,
  FetchInput,
  NormalizedRequest,
} from "./types.js";

/**
 * Default options for the global $fetch
 *
 * These defaults are used by the top-level `$fetch` export.
 * Use `createFetch(...)` when you need per-client defaults.
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
export const mergeHeaders = (
  base?: HeadersInit,
  override?: HeadersInit
): Headers | undefined => {
  if (base === undefined && override === undefined) {
    return undefined;
  }

  if (base === undefined) {
    return new Headers(override);
  }

  if (override === undefined) {
    return new Headers(base);
  }

  const merged = new Headers(base);
  for (const [key, value] of new Headers(override).entries()) {
    merged.set(key, value);
  }
  return merged;
};

const EMPTY_OPTIONS = {} as ExtendedRequestInit;

/**
 * Normalizes fetch `input` and request-level options into a consistent internal shape.
 *
 * @param input - Request URL/path or Request instance.
 * @param options - Optional request options.
 * @returns A normalized request structure for internal processing.
 * @throws {TypeError} When cloning a `Request` fails or the merged headers are invalid.
 */
export const normalizeRequest = (
  input: FetchInput,
  options?: ExtendedRequestInit
): NormalizedRequest => {
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
  source: ExtendedRequestInit["searchParams"] | undefined
): void => {
  for (const [key, value] of new URLSearchParams(source)) {
    target.set(key, value);
  }
};

/**
 * Ensures a URL has a trailing slash for relative URL resolution.
 */
const ensureTrailingSlash = (url: string): string =>
  url.endsWith("/") ? url : `${url}/`;

/**
 * Resolves search params by applying default params, URL params, then request params.
 */
const resolveSearchParams = (
  url: string,
  defaultSearchParams: FetchDefaults["searchParams"] | undefined,
  searchParams: ExtendedRequestInit["searchParams"] | undefined
): string => {
  if (defaultSearchParams === undefined && searchParams === undefined) {
    return url;
  }

  const hashIndex = url.indexOf("#");
  const hasFragment = hashIndex !== -1;
  const urlWithoutHash = hasFragment ? url.slice(0, hashIndex) : url;
  const hash = hasFragment ? url.slice(hashIndex + 1) : "";
  const queryIndex = urlWithoutHash.indexOf("?");
  const pathname =
    queryIndex === -1 ? urlWithoutHash : urlWithoutHash.slice(0, queryIndex);
  const urlSearchParams =
    queryIndex === -1 ? undefined : urlWithoutHash.slice(queryIndex + 1);
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
export const resolveRequestUrl = (
  resourceUrl: string,
  defaults: FetchDefaults,
  searchParams?: ExtendedRequestInit["searchParams"]
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
const prepareRequestInit = (
  options: ExtendedRequestInit,
  defaults: FetchDefaults
): {
  init: RequestInit;
  searchParams: ExtendedRequestInit["searchParams"] | undefined;
  throwOnFetchError: boolean;
  throwOnValidationError: boolean;
} => {
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
    if (init.headers === undefined) {
      init.headers = new Headers({ "Content-Type": "application/json" });
    } else {
      const requestHeaders = new Headers(init.headers);
      if (!requestHeaders.has("Content-Type")) {
        requestHeaders.set("Content-Type", "application/json");
      }
      init.headers = requestHeaders;
    }
  }

  return {
    init,
    searchParams,
    throwOnFetchError,
    throwOnValidationError,
  };
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
export const fetchInternal = async (
  input: FetchInput,
  schema: StandardSchemaV1 | undefined,
  options: ExtendedRequestInit | undefined,
  defaults: FetchDefaults
): Promise<unknown> => {
  const request = normalizeRequest(input, options);
  const { init, searchParams, throwOnFetchError, throwOnValidationError } =
    prepareRequestInit(request.options, defaults);
  const url = resolveRequestUrl(request.url, defaults, searchParams);
  const response = request.request
    ? await fetch(new Request(url, request.request), init)
    : await fetch(url, init);

  if (throwOnFetchError && !response.ok) {
    throw new FetchError(
      `HTTP ${response.status}: ${response.statusText}`,
      response
    );
  }

  if (schema === undefined) {
    return response;
  }

  const raw: unknown = await response.json();
  if (throwOnValidationError) {
    return await standardValidate(schema, raw, { throwOnError: true });
  }
  return await standardValidate(schema, raw, { throwOnError: false });
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
export const createMethod = (fetchFn: $Fetch, method: string): $Fetch => {
  function methodFetch<TSchema extends StandardSchemaV1>(
    input: FetchInput,
    schema: TSchema,
    options: ExtendedRequestInit & {
      throwOnValidationError: false;
    }
  ): Promise<StandardSchemaV1.Result<StandardSchemaV1.InferOutput<TSchema>>>;

  function methodFetch<TSchema extends StandardSchemaV1>(
    input: FetchInput,
    schema: TSchema,
    options?: ExtendedRequestInit & {
      throwOnValidationError?: true;
    }
  ): Promise<StandardSchemaV1.InferOutput<TSchema>>;

  function methodFetch(
    input: FetchInput,
    options?: ExtendedRequestInit
  ): Promise<Response>;

  /**
   * Method-bound `$Fetch` implementation.
   *
   * Resolves schema/option overloads and injects the configured HTTP method.
   */
  async function methodFetch(
    input: FetchInput,
    schemaOrOptions?: StandardSchemaV1 | ExtendedRequestInit,
    optionsOrUndefined?: ExtendedRequestInit
  ): Promise<unknown> {
    if (isStandardSchema(schemaOrOptions)) {
      if (optionsOrUndefined?.throwOnValidationError === false) {
        return await fetchFn(input, schemaOrOptions, {
          ...optionsOrUndefined,
          method,
          throwOnValidationError: false,
        });
      }

      const { throwOnValidationError, ...restOptions } =
        optionsOrUndefined ?? {};

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
