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
