import type { StandardSchemaV1 } from "@standard-schema/spec";
import { FetchError } from "./errors";
import type { RequestInitExtended, FetchDefaults } from "./types";
import { standardValidate } from "./validator";

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

/**
 * Internal fetch implementation used by both $fetch and createFetch
 */
export async function fetchInternal(
  resource: string,
  schema: StandardSchemaV1 | undefined,
  options: RequestInitExtended | undefined,
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

  // Normalize URL by avoiding double slashes between baseURL and resource
  const base = defaults.baseURL.replace(TRAILING_SLASHES, "");
  const path = resource.replace(LEADING_SLASHES, "");
  const url = base ? `${base}/${path}` : resource;

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
