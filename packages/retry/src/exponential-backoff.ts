/**
 * Exponential backoff retry strategy.
 *
 * @module @zap-studio/retry/exponential-backoff
 */

import { applyJitter } from "./jitter.js";
import type { JitterMode, JitterOptions } from "./jitter.js";
import type { RetryDecision, RetryDecisionInput, RetryPolicy } from "./types.js";

/**
 * Configuration for `exponentialBackoff(...)`.
 *
 * @example
 * const options: ExponentialBackoffOptions = {
 *   maxAttempts: 5,
 *   baseDelayMs: 100,
 *   maxDelayMs: 2_000,
 *   jitter: "full",
 * };
 */
export interface ExponentialBackoffOptions {
  /**
   * Maximum number of attempts (including the first) before giving up.
   */
  maxAttempts: number;
  /**
   * Initial delay in milliseconds, doubled each retry until capped.
   */
  baseDelayMs: number;
  /**
   * Hard upper bound in milliseconds for computed exponential delay.
   */
  maxDelayMs: number;
  /**
   * Optional jitter applied to the computed delay, after capping at
   * `maxDelayMs`.
   */
  jitter?: JitterMode | JitterOptions;
}

/**
 * Creates a retry policy with exponential delay growth up to a max cap.
 *
 * @example
 * const policy = exponentialBackoff({
 *   maxAttempts: 5,
 *   baseDelayMs: 100,
 *   maxDelayMs: 2_000,
 * });
 */
export const exponentialBackoff = (options: ExponentialBackoffOptions): RetryPolicy => {
  const { maxAttempts, baseDelayMs, maxDelayMs, jitter } = options;

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

      const exponent = Math.max(0, input.attempt - 1);
      const cappedDelayMs = Math.min(maxDelayMs, baseDelayMs * 2 ** exponent);
      const delayMs = applyJitter(cappedDelayMs, jitter);

      return { delayMs, reason: "retry", shouldRetry: true };
    },
  };
};
