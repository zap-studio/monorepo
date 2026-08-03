/**
 * Throw-mode execution path for `BaseRetryPolicy.run` (default when
 * `throwOnExhausted` is not `false`).
 *
 * @module @zap-studio/retry/_throw-mode (private)
 */

import { sleepWithAbortSignal, throwIfAborted } from "./abort.js";
import type { RetryPolicy } from "./types.js";

/**
 * Runs the throw-mode retry loop: throws `RetryError` on exhaustion and
 * `AbortError` when `signal` aborts.
 *
 * @param policy - Object providing `next` and `onExhausted` (same contract as
 *   `BaseRetryPolicy`).
 * @param execute - Async work callback per attempt.
 * @param sleep - Delay function between retries.
 * @param signal - Optional cancel signal.
 * @returns Resolves to the first successful return value.
 * @throws {RetryError} When retries are exhausted and `onExhausted` returns
 *   the terminal error.
 * @throws {AbortError} When `signal` is already aborted or aborts while waiting.
 * @throws {Error} Any error thrown by `next`, `onExhausted`, or `sleep`.
 */
export const runThrowMode = async <T, TError, TData>(
  policy: RetryPolicy<TError, TData>,
  execute: (attempt: number) => Promise<T>,
  sleep: (delayMs: number) => Promise<void>,
  signal?: AbortSignal
): Promise<T> => {
  let attempt = 1;

  while (true) {
    throwIfAborted(signal);

    try {
      // oxlint-disable-next-line no-await-in-loop -- Retry attempts must run sequentially.
      return await execute(attempt);
    } catch (error) {
      throwIfAborted(signal);

      // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Policy error generic represents the caller's thrown error domain.
      const typedError = error as TError;
      const decision = policy.next({
        attempt,
        error: typedError,
      });

      if (!decision.shouldRetry) {
        throw policy.onExhausted({
          attempts: attempt,
          error: typedError,
        });
      }

      if (decision.delayMs > 0) {
        // oxlint-disable-next-line no-await-in-loop -- Delay belongs between sequential retry attempts.
        await (signal === undefined
          ? sleep(decision.delayMs)
          : sleepWithAbortSignal(sleep, decision.delayMs, signal));
      }

      attempt += 1;
    }
  }
};
