import type { StandardSchemaV1 } from "@standard-schema/spec";
import { FetchError } from "../errors";
import type {
  $Fetch,
  ExtendedRequestInit,
  FetchDefaults,
  SearchParams,
} from "../types";
import { isStandardSchema, standardValidate } from "../validator";

/**
 * Merges two HeadersInit objects, with the second one taking precedence
 *
 * @example
 * const baseHeaders = { "Authorization": "Bearer token", "Content-Type": "application/json" };
 * const overrideHeaders = { "Content-Type": "application/xml", "X-Custom-Header": "value" };
 *
 * const merged = mergeHeaders(baseHeaders, overrideHeaders);
 *
 * // Resulting headers:
 * // {
 * //   "Authorization": "Bearer token",
 * //   "Content-Type": "application/xml",
 * //   "X-Custom-Header": "value"
 * // }
 */
export function mergeHeaders(
  base: HeadersInit | undefined,
  override: HeadersInit | undefined
): Headers | undefined {
  if (!(base || override)) {
    return;
  }

  const merged = new Headers(base);
  if (override) {
    const overrideHeaders = new Headers(override);
    for (const [key, value] of overrideHeaders.entries()) {
      merged.set(key, value);
    }
  }
  return merged;
}

/**
 * Removes trailing slashes from a string
 */
function trimTrailingSlashes(str: string): string {
  let end = str.length;
  while (end > 0 && str[end - 1] === "/") {
    end -= 1;
  }
  return str.slice(0, end);
}

/**
 * Removes leading slashes from a string
 */
function trimLeadingSlashes(str: string): string {
  let start = 0;
  while (start < str.length && str[start] === "/") {
    start += 1;
  }
  return str.slice(start);
}

const ABSOLUTE_URL_PATTERN = /^(?:https?:)?\/\//i;

/**
 * Checks if a URL is absolute (starts with http://, https://, or //)
 */
function isAbsoluteURL(url: string): boolean {
  return ABSOLUTE_URL_PATTERN.test(url);
}

/**
 * Normalizes search parameters into a URLSearchParams object.
 */
function normalizeSearchParams(
  input: SearchParams | undefined
): URLSearchParams {
  if (input === undefined || input === null) {
    return new URLSearchParams();
  }

  if (input instanceof URLSearchParams) {
    return new URLSearchParams(input);
  }

  if (typeof input === "string") {
    return new URLSearchParams(input);
  }

  if (Array.isArray(input)) {
    return new URLSearchParams(input);
  }

  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(input)) {
    params.set(k, v);
  }

  return params;
}

/**
 * Parses a URL string into its path, query, and hash components.
 * Handles both absolute URLs (using URL constructor) and relative paths.
 */
function parseUrlComponents(url: string): {
  pathOnly: string;
  existingQuery: string;
  hash: string;
} {
  // Try parsing as absolute URL first
  if (isAbsoluteURL(url)) {
    try {
      const parsed = new URL(url);
      const pathOnly = `${parsed.origin}${parsed.pathname}`;
      // parsed.search includes the leading "?", so strip it
      const existingQuery = parsed.search.startsWith("?")
        ? parsed.search.slice(1)
        : parsed.search;
      // URL constructor normalizes away empty hash, if original URL had # at end, preserve it
      let hash = parsed.hash;
      if (hash === "" && url.endsWith("#")) {
        hash = "#";
      }
      return { pathOnly, existingQuery, hash };
    } catch {
      // Fall through to manual parsing if URL constructor fails
    }
  }

  // Manual parsing for relative URLs or if URL constructor failed
  let hash = "";
  let urlWithoutHash = url;
  const hashIndex = url.indexOf("#");
  if (hashIndex !== -1) {
    hash = url.slice(hashIndex);
    urlWithoutHash = url.slice(0, hashIndex);
  }

  // Find the first "?" to split path and query
  const queryIndex = urlWithoutHash.indexOf("?");
  if (queryIndex === -1) {
    return { pathOnly: urlWithoutHash, existingQuery: "", hash };
  }

  const pathOnly = urlWithoutHash.slice(0, queryIndex);
  const existingQuery = urlWithoutHash.slice(queryIndex + 1);
  return { pathOnly, existingQuery, hash };
}

/**
 * Builds a URL with merged search parameters from factory defaults,
 * request options, and existing query parameters.
 *
 * This function takes a base URL, factory search parameters,
 * and request search parameters, and combines them into a single URL.
 *
 * Priority (highest to lowest):
 * 1. Request search parameters (highest priority, overwrites all others)
 * 2. Existing query parameters from the URL (overwrites factory defaults)
 * 3. Factory search parameters (lowest priority, overwritten by all others)
 *
 * If no search parameters are provided, the URL will not have a query string.
 * Any trailing hash/fragment is preserved.
 */
function buildUrlWithMergedSearchParams(
  url: string,
  factorySearch: FetchDefaults["searchParams"] | undefined,
  requestSearch: ExtendedRequestInit["searchParams"] | undefined
): string {
  const { pathOnly, existingQuery, hash } = parseUrlComponents(url);

  // Early return if no search params to merge
  const hasSearchParams = factorySearch ?? requestSearch ?? existingQuery;
  if (!hasSearchParams) {
    return url;
  }

  const mergedParams = new URLSearchParams();

  const resourceParams = new URLSearchParams(existingQuery);
  const factoryParams = normalizeSearchParams(factorySearch);
  const reqParams = normalizeSearchParams(requestSearch);

  for (const [k, v] of factoryParams.entries()) {
    mergedParams.set(k, v);
  }

  for (const [k, v] of resourceParams.entries()) {
    mergedParams.set(k, v);
  }

  for (const [k, v] of reqParams.entries()) {
    mergedParams.set(k, v);
  }

  const queryString = mergedParams.toString();
  if (queryString) {
    return `${pathOnly}?${queryString}${hash}`;
  }

  return `${pathOnly}${hash}`;
}

/**
 * Internal fetch implementation used by both $fetch and createFetch
 */
export async function fetchInternal(
  resource: string,
  schema: StandardSchemaV1 | undefined,
  options: ExtendedRequestInit | undefined,
  defaults: FetchDefaults
): Promise<unknown> {
  const {
    throwOnValidationError = defaults.throwOnValidationError,
    throwOnFetchError = defaults.throwOnFetchError,
    headers: requestHeaders,
    searchParams: requestSearchParams,
    ...rest
  } = options || {};

  const mergedHeaders = mergeHeaders(defaults.headers, requestHeaders);
  const init = { ...rest, headers: mergedHeaders } as RequestInit;

  // Auto-stringify body and set default Content-Type if we have a schema
  if (schema && init.body) {
    init.body = JSON.stringify(init.body);

    const existingHeaders = new Headers(init.headers);
    if (!existingHeaders.has("Content-Type")) {
      existingHeaders.set("Content-Type", "application/json");
    }

    init.headers = existingHeaders;
  }

  // For absolute URLs, ignore baseURL entirely
  let url: string;
  if (isAbsoluteURL(resource)) {
    url = resource;
  } else {
    // Normalize URL by avoiding double slashes between baseURL and resource
    const base = trimTrailingSlashes(defaults.baseURL);
    const path = trimLeadingSlashes(resource);
    url = base ? `${base}/${path}` : resource;
  }

  // Merge query/search params
  url = buildUrlWithMergedSearchParams(
    url,
    defaults.searchParams,
    requestSearchParams
  );

  const response = await fetch(url, init);

  if (throwOnFetchError && !response.ok) {
    throw new FetchError(
      `HTTP ${response.status}: ${response.statusText}`,
      response
    );
  }

  // For json with schema, validate
  if (schema) {
    const raw = await response.json();
    return standardValidate(schema, raw, throwOnValidationError);
  }

  // No validation, return raw response data
  return response;
}

/**
 * Creates an HTTP method helper bound to a fetch function
 */
export function createMethod<TFetch extends $Fetch>(
  fetchFn: TFetch,
  method: string
): $Fetch {
  function methodFetch<TSchema extends StandardSchemaV1>(
    resource: string,
    schema: TSchema,
    options: Omit<ExtendedRequestInit<false>, "method">
  ): Promise<StandardSchemaV1.Result<StandardSchemaV1.InferOutput<TSchema>>>;

  function methodFetch<TSchema extends StandardSchemaV1>(
    resource: string,
    schema: TSchema,
    options?: Omit<ExtendedRequestInit<true | undefined>, "method">
  ): Promise<StandardSchemaV1.InferOutput<TSchema>>;

  function methodFetch(
    resource: string,
    options?: Omit<ExtendedRequestInit, "method">
  ): Promise<Response>;

  function methodFetch(
    resource: string,
    schemaOrOptions?: StandardSchemaV1 | Omit<ExtendedRequestInit, "method">,
    optionsOrUndefined?: Omit<ExtendedRequestInit, "method">
  ): Promise<unknown> {
    const [schema, options] = isStandardSchema(schemaOrOptions)
      ? [schemaOrOptions, optionsOrUndefined]
      : [undefined, schemaOrOptions];

    return (fetchFn as (...args: unknown[]) => Promise<unknown>)(
      resource,
      schema,
      { ...options, method }
    );
  }

  return methodFetch;
}
