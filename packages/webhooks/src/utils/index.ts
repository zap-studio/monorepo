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
export const constantTimeEquals = (a: string, b: string): boolean => {
  if (a.length !== b.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < a.length; i += 1) {
    // oxlint-disable-next-line no-bitwise -- XOR accumulation is the constant-time comparison primitive.
    result |= (a.codePointAt(i) ?? 0) ^ (b.codePointAt(i) ?? 0);
  }

  return result === 0;
};
