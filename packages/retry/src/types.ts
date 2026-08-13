/**
 * Public type contracts for retry policies and runner behavior.
 *
 * @module @zap-studio/retry/types
 */

import type { AbortError, RetryError } from "./errors.js";

/**
 * Retry policy contract used by `BaseRetryPolicy`.
 *
 * @example
 * const policy: RetryPolicy = {
 *   next: ({ attempt }) => ({ shouldRetry: attempt < 3, delayMs: 100 }),
 *   onExhausted: ({ attempts }) => new RetryError("done", { attempts }),
 * };
 */
export interface RetryPolicy<TError = unknown, TData = unknown> {
  /**
   * Returns the retry decision for a failed attempt.
   *
   * @throws {Error} Any error thrown by the policy implementation.
   */
  next: (input: RetryDecisionInput<TError, TData>) => RetryDecision;
  /**
   * Builds the terminal error used when retries are exhausted.
   *
   * @throws {Error} Any error thrown by the policy implementation.
   */
  onExhausted: (input: RetryExhaustedInput<TError, TData>) => RetryError;
}

/**
 * Decision returned by a retry policy for a specific attempt.
 *
 * @example
 * const decision: RetryDecision = { shouldRetry: true, delayMs: 200, reason: "retry" };
 */
export interface RetryDecision {
  /**
   * When `true`, the runner may schedule another attempt (subject to
   * `delayMs` and the runner's abort rules).
   */
  readonly shouldRetry: boolean;
  /**
   * Milliseconds to wait before the next attempt when `shouldRetry` is `true`.
   */
  readonly delayMs: number;
  /**
   * Optional machine-readable reason for the decision.
   */
  readonly reason?: "retry" | "max-attempts-reached" | "policy-declined";
}

/**
 * Input passed to `RetryPolicy.next(...)` for each failed attempt.
 *
 * @example
 * const input: RetryDecisionInput = { attempt: 2, error: new Error("timeout") };
 */
export interface RetryDecisionInput<TError = unknown, TData = unknown> {
  /**
   * One-based attempt number for the current failure.
   */
  readonly attempt: number;
  /**
   * Optional policy-level maximum attempts, when a policy wants to pass it
   * through to `next`.
   */
  readonly maxAttempts?: number;
  /**
   * Error raised by the most recent `execute(attempt)` call, when a failure
   * occurred.
   */
  readonly error?: TError;
  /**
   * Optional data captured alongside the failure, when a policy populates
   * it.
   */
  readonly data?: TData;
}

/**
 * Input passed to `RetryPolicy.onExhausted(...)` when retries stop.
 *
 * @example
 * const input: RetryExhaustedInput = { attempts: 5, error: new Error("timeout") };
 */
export interface RetryExhaustedInput<TError = unknown, TData = unknown> {
  /**
   * Count of completed attempts that led to stopping retries.
   */
  readonly attempts: number;
  /**
   * Last execution error, when available.
   */
  readonly error?: TError;
  /**
   * Last captured data, when a policy or runner supplies it.
   */
  readonly data?: TData;
}

/**
 * Options for `BaseRetryPolicy.run(...)`.
 *
 * @example
 * const options: RetryRunOptions = { throwOnExhausted: false, signal: controller.signal };
 */
export interface RetryRunOptions {
  /**
   * Delay function used between retry attempts.
   *
   * @throws {Error} Any error thrown or rejected by the custom delay implementation.
   */
  readonly sleep?: (delayMs: number) => Promise<void>;
  /**
   * Abort signal used to cancel retry orchestration.
   *
   * When aborted, the runner stops retrying and terminates immediately.
   */
  readonly signal?: AbortSignal;
  /**
   * When `true`, the runner throws a `RetryError` when retries are exhausted.
   *
   * When `false`, the runner returns a `RetryRunResult` discriminated union.
   *
   * @default true
   */
  readonly throwOnExhausted?: boolean;
}

/**
 * Result union returned by non-throw runner mode.
 *
 * - Success: `ok: true` with the resolved `value`.
 * - Failure: `ok: false` with terminal `error` and completed `attempts` count
 *   (exhaustion or abort).
 *
 * @example
 * const result: RetryRunResult<string> = await policy.run(doWork, { throwOnExhausted: false });
 * if (!result.ok) console.error(result.error);
 */
export type RetryRunResult<T> =
  | {
      /**
       * Discriminator for a successful run.
       */
      ok: true;
      /**
       * Successful return value from the final attempt.
       */
      value: T;
    }
  | {
      /**
       * Discriminator for a failed or aborted run.
       */
      ok: false;
      /**
       * Terminal error: `RetryError` when retries are exhausted, or
       * `AbortError` when the run is canceled.
       */
      error: RetryError | AbortError;
      /**
       * Number of attempts that completed before the terminal outcome.
       */
      attempts: number;
    };
