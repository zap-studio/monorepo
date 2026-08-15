/**
 * Linear backoff retry strategy.
 *
 * @module @zap-studio/retry/linear-backoff
 */

import type {
  RetryDecision,
  RetryDecisionInput,
  RetryPolicy,
} from "./types.js";

/**
 * Configuration for `linearBackoff(...)`.
 *
 * @example
 * const options: LinearBackoffOptions = {
 *   maxAttempts: 5,
 *   baseDelayMs: 100,
 *   incrementMs: 100,
 *   maxDelayMs: 2_000,
 * };
 */
export interface LinearBackoffOptions {
  /**
   * Maximum number of attempts (including the first) before giving up.
   */
  maxAttempts: number;
  /**
   * Delay in milliseconds after the first failed attempt.
   */
  baseDelayMs: number;
  /**
   * Amount added to the delay for each subsequent retry.
   */
  incrementMs: number;
  /**
   * Hard upper bound in milliseconds for computed linear delay.
   */
  maxDelayMs: number;
}

/**
 * Creates a retry policy with linear delay growth up to a max cap.
 *
 * @example
 * const policy = linearBackoff({
 *   maxAttempts: 5,
 *   baseDelayMs: 100,
 *   incrementMs: 100,
 *   maxDelayMs: 2_000,
 * });
 */
export const linearBackoff = (options: LinearBackoffOptions): RetryPolicy => {
  const { maxAttempts, baseDelayMs, incrementMs, maxDelayMs } = options;

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

      const delayMs = Math.min(
        maxDelayMs,
        baseDelayMs + incrementMs * (input.attempt - 1)
      );

      return { delayMs, reason: "retry", shouldRetry: true };
    },
  };
};
