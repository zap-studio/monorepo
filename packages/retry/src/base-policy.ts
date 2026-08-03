/**
 * Retry runner base class and shared orchestration implementation.
 *
 * @module @zap-studio/retry/base-policy
 */

import { RetryError } from "./errors.js";
import { runResultMode } from "./result-mode.js";
import { defaultSleep } from "./sleep.js";
import { runThrowMode } from "./throw-mode.js";
import type {
  RetryDecision,
  RetryDecisionInput,
  RetryExhaustedInput,
  RetryPolicy,
  RetryRunOptions,
  RetryRunResult,
} from "./types.js";

/**
 * Base class for implementing retry policies and running retry orchestration.
 *
 * Extend this class and implement {@link BaseRetryPolicy.next} to define retry
 * behavior, then call {@link BaseRetryPolicy.run} to execute operations with that
 * policy.
 */
export abstract class BaseRetryPolicy<
  TError = unknown,
  TData = unknown,
> implements RetryPolicy<TError, TData> {
  /**
   * Returns the retry decision for a failed attempt.
   *
   * @param input - Attempt context used to compute retry behavior.
   * @throws {Error} Any error thrown by a concrete retry policy implementation.
   */
  public abstract next(input: RetryDecisionInput<TError, TData>): RetryDecision;

  /**
   * Builds the terminal error thrown or returned when retries are exhausted.
   *
   * Override this when you need custom terminal error types.
   *
   * @param input - Exhaustion context.
   * @returns `RetryError` by default.
   * @throws {Error} Any error thrown by an overriding policy implementation.
   */
  // oxlint-disable-next-line class-methods-use-this -- RetryPolicy requires an instance hook that subclasses may override.
  public onExhausted(input: RetryExhaustedInput<TError, TData>): RetryError {
    return new RetryError("Retry policy exhausted all attempts.", {
      attempts: input.attempts,
      lastData: input.data,
      lastError: input.error,
    });
  }

  /**
   * Runs retry orchestration in non-throw mode.
   *
   * @param execute - Async function to execute per attempt.
   * @param options - Runner settings with `throwOnExhausted: false`.
   * @returns A discriminated result union containing success value or terminal error.
   * @throws {Error} Any error thrown by `next`, `onExhausted`, or a custom `sleep`.
   */
  public async run<T>(
    execute: (attempt: number) => Promise<T>,
    options: RetryRunOptions & { throwOnExhausted: false }
  ): Promise<RetryRunResult<T>>;

  /**
   * Runs retry orchestration and throws terminal error on exhaustion.
   *
   * @param execute - Async function to execute per attempt.
   * @param options - Optional runner settings.
   * @returns The successful execution value.
   * @throws {RetryError} When retries are exhausted and `onExhausted` returns the
   *   terminal retry error. The default implementation returns `RetryError` with the last
   *   execution failure available on `RetryError.lastError`.
   * @throws {AbortError} When `options.signal` is already aborted or aborts while retrying.
   * @throws {Error} Any error thrown by `next`, by `onExhausted`, or by a custom `sleep`
   *   function.
   */
  public async run<T>(
    execute: (attempt: number) => Promise<T>,
    options?: RetryRunOptions & { throwOnExhausted?: true }
  ): Promise<T>;

  /**
   * Runs retry orchestration in non-throw mode.
   *
   * When `throwOnExhausted` is `false`, returns a discriminated result union.
   *
   * @param execute - Async function to execute per attempt.
   * @param options - Runner settings.
   * @returns Success value or terminal result object based on option mode.
   * @throws {Error} Any error thrown by `next`, by `onExhausted`, or by a custom `sleep`
   *   function. When `throwOnExhausted` is `false`, exhaustion itself is returned
   *   as `{ ok: false }` instead of thrown.
   *   Cancellation is returned as `{ ok: false, error: AbortError }` in non-throw
   *   mode.
   *
   * @example
   * const result = await policy.run(doWork, { throwOnExhausted: false });
   * if (!result.ok) console.error(result.error);
   */
  public async run<T>(
    execute: (attempt: number) => Promise<T>,
    options: RetryRunOptions = {}
  ): Promise<T | RetryRunResult<T>> {
    const sleep = options.sleep ?? defaultSleep;
    const { signal } = options;
    if (options.throwOnExhausted === false) {
      return await runResultMode(this, execute, sleep, signal);
    }

    return await runThrowMode(this, execute, sleep, signal);
  }
}
