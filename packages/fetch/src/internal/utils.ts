import type { StandardSchemaV1 } from "@standard-schema/spec";
import type { $fetch } from "..";
import { FetchError } from "../errors";
import type { ExtendedRequestInit, FetchDefaults } from "../types";
import { standardValidate } from "../validator";

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

const TRAILING_SLASHES = /\/+$/;
const LEADING_SLASHES = /^\/+/;
const ABSOLUTE_URL_PATTERN = /^(https?:)?\/\//i;

/**
 * Checks if a URL is absolute (starts with http://, https://, or //)
 */
function isAbsoluteURL(url: string): boolean {
  return ABSOLUTE_URL_PATTERN.test(url);
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
    const base = defaults.baseURL.replace(TRAILING_SLASHES, "");
    const path = resource.replace(LEADING_SLASHES, "");
    url = base ? `${base}/${path}` : resource;
  }

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
export function createMethod<TFetch extends typeof $fetch>(
  fetchFn: TFetch,
  method: string
) {
  return <TSchema extends StandardSchemaV1>(
    resource: string,
    schema: TSchema,
    options?: Omit<ExtendedRequestInit, "method">
  ) => fetchFn(resource, schema, { ...options, method });
}
