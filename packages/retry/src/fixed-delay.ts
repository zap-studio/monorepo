/**
 * Fixed-delay retry strategy.
 *
 * @module @zap-studio/retry/fixed-delay
 */

import { BaseRetryPolicy } from "./base-policy.js";
import type { RetryDecision, RetryDecisionInput } from "./types.js";

/**
 * Configuration for `FixedDelay`.
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
 * Retries with a constant delay between attempts.
 *
 * @example
 * const policy = new FixedDelay({
 *   maxAttempts: 3,
 *   delayMs: 250,
 * });
 */
export class FixedDelay extends BaseRetryPolicy {
  /**
   * Maximum number of attempts before the policy returns `max-attempts-reached`.
   */
  private readonly maxAttempts: number;
  /**
   * Constant delay in milliseconds before each subsequent attempt.
   */
  private readonly delayMs: number;

  /**
   * Creates a fixed-delay retry policy.
   */
  constructor(options: FixedDelayOptions) {
    super();
    this.maxAttempts = options.maxAttempts;
    this.delayMs = options.delayMs;
  }

  /**
   * Computes retry decision for the current attempt.
   */
  public next(input: RetryDecisionInput): RetryDecision {
    if (input.attempt >= this.maxAttempts) {
      return { delayMs: 0, reason: "max-attempts-reached", shouldRetry: false };
    }

    return { delayMs: this.delayMs, reason: "retry", shouldRetry: true };
  }
}
