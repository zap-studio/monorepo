/**
 * Fixed-delay retry strategy.
 *
 * @module @zap-studio/retry/fixed-delay
 */

import type { RetryDecision, RetryDecisionInput, RetryPolicy } from "./types.js";

/**
 * Configuration for `fixedDelay(...)`.
 *
 * @example
 * const options: FixedDelayOptions = { maxAttempts: 3, delayMs: 250 };
 */
export interface FixedDelayOptions {
  /**
   * Maximum number of attempts (including the first) before giving up.
   */
  maxAttempts: number;
  /**
   * Constant delay in milliseconds before each retry after a failure.
   */
  delayMs: number;
}

/**
 * Creates a retry policy with a constant delay between attempts.
 *
 * @example
 * const policy = fixedDelay({
 *   maxAttempts: 3,
 *   delayMs: 250,
 * });
 */
export const fixedDelay = (options: FixedDelayOptions): RetryPolicy => {
  const { maxAttempts, delayMs } = options;

  return {
    /**
     * Computes retry decision for the current attempt.
     */
    next(input: RetryDecisionInput): RetryDecision {
      if (input.attempt >= maxAttempts) {
        return {
          delayMs: 0,
          reason: "max-attempts-reached",
          shouldRetry: false,
        };
      }

      return { delayMs, reason: "retry", shouldRetry: true };
    },
  };
};
