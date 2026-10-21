/**
 * Linear backoff retry strategy.
 *
 * @module @zap-studio/retry/linear-backoff
 */

import type { JitterMode, JitterOptions } from "./jitter.ts";
import type { RetryDecision, RetryDecisionInput, RetryPolicy } from "./types.ts";

import { applyJitter } from "./jitter.ts";

/**
 * Configuration for `linearBackoff(...)`.
 *
 * @example
 * const options: LinearBackoffOptions = {
 *   maxAttempts: 5,
 *   baseDelayMs: 100,
 *   incrementMs: 100,
 *   maxDelayMs: 2_000,
 *   jitter: "equal",
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
  /**
   * Optional jitter applied to the computed delay, after capping at
   * `maxDelayMs`.
   */
  jitter?: JitterMode | JitterOptions;
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
  const { maxAttempts, baseDelayMs, incrementMs, maxDelayMs, jitter } = options;

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

      const cappedDelayMs = Math.min(maxDelayMs, baseDelayMs + incrementMs * (input.attempt - 1));
      const delayMs = applyJitter(cappedDelayMs, jitter);

      return { delayMs, reason: "retry", shouldRetry: true };
    },
  };
};
