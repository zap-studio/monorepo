/**
 * Throw-mode execution path for `BaseRetryPolicy.run` (default when
 * `throwOnExhausted` is not `false`).
 *
 * @module @zap-studio/retry/throw-mode
 */

import { sleepWithAbortSignal, throwIfAborted } from "./abort.js";
import type { RetryError } from "./errors.js";
import type {
  RetryDecision,
  RetryDecisionInput,
  RetryExhaustedInput,
} from "./types.js";

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
 * @throws Any error thrown by `next`, `onExhausted`, or `sleep`.
 */
export async function runThrowMode<T, TError, TData>(
  policy: {
    next: (input: RetryDecisionInput<TError, TData>) => RetryDecision;
    onExhausted: (input: RetryExhaustedInput<TError, TData>) => RetryError;
  },
  execute: (attempt: number) => Promise<T>,
  sleep: (delayMs: number) => Promise<void>,
  signal?: AbortSignal
): Promise<T> {
  let attempt = 1;

  while (true) {
    throwIfAborted(signal);

    try {
      return await execute(attempt);
    } catch (error) {
      throwIfAborted(signal);

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
        if (signal) {
          await sleepWithAbortSignal(sleep, decision.delayMs, signal);
        } else {
          await sleep(decision.delayMs);
        }
      }

      attempt += 1;
    }
  }
}
