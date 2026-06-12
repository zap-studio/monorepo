/**
 * Header utility helpers for request normalization and merging.
 *
 * @module @zap-studio/fetch/headers
 */

/**
 * Merges two HeadersInit objects, with the second one taking precedence.
 *
 * @param base - Base/default headers.
 * @param override - Request-level override headers.
 * @returns A merged `Headers` object, or `undefined` when both inputs are empty.
 * @throws {TypeError} When either header input contains invalid header names or values.
 *
 * @example
 * const headers = mergeHeaders(
 *   { Authorization: "Bearer token" },
 *   { "X-Trace-Id": "abc" },
 * );
 *
 * console.log(headers?.get("Authorization")); // Bearer token
 */
export function mergeHeaders(
  base?: HeadersInit,
  override?: HeadersInit
): Headers | undefined {
  if (!(base || override)) {
    return;
  }

  if (!base) {
    return new Headers(override);
  }

  if (!override) {
    return new Headers(base);
  }

  const merged = new Headers(base);
  for (const [key, value] of new Headers(override).entries()) {
    merged.set(key, value);
  }
  return merged;
}
