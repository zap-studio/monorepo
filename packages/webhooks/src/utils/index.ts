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
    // oxlint-disable-next-line no-bitwise, unicorn/prefer-code-point -- XOR is the constant-time compare trick; charCodeAt reads each char with the same cost, and inputs are plain ASCII hex.
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return result === 0;
};
