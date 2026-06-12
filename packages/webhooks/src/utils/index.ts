/**
 * Utility helpers for webhook internals.
 *
 * @module @zap-studio/webhooks/utils
 */

/**
 * Compares two strings in constant time to prevent timing attacks.
 *
 * @example
 * ```ts
 * const isEqual = constantTimeEquals("string1", "string2"); // returns false
 * ```
 */
export function constantTimeEquals(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < a.length; i += 1) {
    result |= a.codePointAt(i) ^ b.codePointAt(i);
  }

  return result === 0;
}
