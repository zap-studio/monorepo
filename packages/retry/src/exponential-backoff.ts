/**
 * Exponential backoff retry strategy.
 *
 * @module @zap-studio/retry/exponential-backoff
 */

import { BaseRetryPolicy } from "./base-policy.js";
import type { RetryDecision, RetryDecisionInput } from "./types.js";

/**
 * Configuration for `ExponentialBackoff`.
 *
 * @example
 * const options: ExponentialBackoffOptions = {
 *   maxAttempts: 5,
 *   baseDelayMs: 100,
 *   maxDelayMs: 2_000,
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
}

/**
 * Retries with exponential delay growth up to a max cap.
 *
 * @example
 * const policy = new ExponentialBackoff({
 *   maxAttempts: 5,
 *   baseDelayMs: 100,
 *   maxDelayMs: 2_000,
 * });
 */
export class ExponentialBackoff extends BaseRetryPolicy {
  /**
   * Maximum number of attempts before the policy returns `max-attempts-reached`.
   */
  private readonly maxAttempts: number;
  /**
   * Base delay in milliseconds used in `baseDelayMs * 2 ** (attempt - 1)`.
   */
  private readonly baseDelayMs: number;
  /**
   * Upper cap for computed delay, applied with `Math.min`.
   */
  private readonly maxDelayMs: number;

  /**
   * Creates an exponential backoff retry policy.
   */
  constructor(options: ExponentialBackoffOptions) {
    super();
    this.maxAttempts = options.maxAttempts;
    this.baseDelayMs = options.baseDelayMs;
    this.maxDelayMs = options.maxDelayMs;
  }

  /**
   * Computes retry decision for the current attempt.
   */
  public next(input: RetryDecisionInput): RetryDecision {
    if (input.attempt >= this.maxAttempts) {
      return { delayMs: 0, reason: "max-attempts-reached", shouldRetry: false };
    }

    const exponent = Math.max(0, input.attempt - 1);
    const delayMs = Math.min(this.maxDelayMs, this.baseDelayMs * 2 ** exponent);

    return { delayMs, reason: "retry", shouldRetry: true };
  }
}
