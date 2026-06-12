/**
 * Result-mode execution path for `BaseRetryPolicy.run` when
 * `throwOnExhausted: false` is set.
 *
 * @module @zap-studio/retry/result-mode
 */

// oxlint-disable no-use-before-define -- Public loop stays first; private helpers follow below.

import { sleepWithAbortSignal, toAbortError } from "./abort.js";
import type { RetryError } from "./errors.js";
import type {
  RetryDecision,
  RetryDecisionInput,
  RetryExhaustedInput,
  RetryRunResult,
} from "./types.js";

/**
 * Runs the non-throw retry loop, returning
 * `RetryRunResult`.
 *
 * @param policy - Object providing `next` and `onExhausted` (same contract as
 *   `BaseRetryPolicy`).
 * @param execute - Async work callback per attempt.
 * @param sleep - Delay function between retries.
 * @param signal - Optional cancel signal.
 * @returns Terminal success or failure object.
 * @throws {Error} Any error thrown by `next`, `onExhausted`, or a non-abort `sleep`
 *   failure.
 */
export const runResultMode = async <T, TError, TData>(
  policy: {
    next: (input: RetryDecisionInput<TError, TData>) => RetryDecision;
    onExhausted: (input: RetryExhaustedInput<TError, TData>) => RetryError;
  },
  execute: (attempt: number) => Promise<T>,
  sleep: (delayMs: number) => Promise<void>,
  signal?: AbortSignal
): Promise<RetryRunResult<T>> => {
  let attempt = 1;

  while (true) {
    const abortResult = buildAbortResult(signal, Math.max(0, attempt - 1));
    if (abortResult !== undefined) {
      return abortResult;
    }

    // oxlint-disable-next-line no-await-in-loop -- Retry attempts must run sequentially.
    const execution = await runAttempt(execute, attempt);
    if (execution.ok) {
      return { ok: true, value: execution.value };
    }

    // oxlint-disable-next-line no-await-in-loop -- Failure handling belongs to the current sequential attempt.
    const failure = await handleFailure(policy, {
      attempt,
      // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Policy error generic represents the caller's thrown error domain.
      error: execution.error as TError,
      signal,
      sleep,
    });
    if (failure !== undefined) {
      return failure;
    }

    attempt += 1;
  }
};

/**
 * Runs one `execute(attempt)` call and returns either a success value or a
 * captured error without rethrowing.
 *
 * @param execute - User work callback.
 * @param attempt - One-based attempt number passed to `execute`.
 * @returns A tagged success with `value` or a tagged failure with `error`.
 */
const runAttempt = async <T>(
  execute: (attempt: number) => Promise<T>,
  attempt: number
): Promise<{ ok: true; value: T } | { ok: false; error: unknown }> => {
  try {
    return {
      ok: true,
      value: await execute(attempt),
    };
  } catch (error) {
    return {
      error,
      ok: false,
    };
  }
};

/**
 * After a failed attempt, applies abort rules, `next`, optional delay, and
 * either returns a terminal `RetryRunResult` or `undefined` to continue.
 *
 * @param policy - Retry policy hooks (`next`, `onExhausted`) matching
 *   `BaseRetryPolicy`.
 * @param params - Failure context for the current attempt.
 * @param params.attempt - Current attempt number.
 * @param params.error - Error thrown by the attempt.
 * @param params.sleep - Delay function between retries.
 * @param params.signal - Optional abort signal.
 * @returns Terminal non-throw result if the loop should stop, otherwise
 *   `undefined` to schedule another attempt.
 * @throws {Error} Any error thrown by `next`, `onExhausted`, or a custom `sleep` when
 *   the error is not an abort.
 */
const handleFailure = async <TError, TData>(
  policy: {
    next: (input: RetryDecisionInput<TError, TData>) => RetryDecision;
    onExhausted: (input: RetryExhaustedInput<TError, TData>) => RetryError;
  },
  params: {
    attempt: number;
    error: TError;
    sleep: (delayMs: number) => Promise<void>;
    signal: AbortSignal | undefined;
  }
): Promise<RetryRunResult<never> | undefined> => {
  const { attempt, error, sleep, signal } = params;
  const abortResult = buildAbortResult(signal, attempt);
  if (abortResult !== undefined) {
    return abortResult;
  }

  const decision = policy.next({
    attempt,
    error,
  });

  if (!decision.shouldRetry) {
    const terminalError = policy.onExhausted({
      attempts: attempt,
      error,
    });

    return {
      attempts: attempt,
      error: terminalError,
      ok: false,
    };
  }

  if (decision.delayMs > 0) {
    const delayAbortResult = await waitForDelay(
      sleep,
      decision.delayMs,
      signal,
      attempt
    );
    if (delayAbortResult !== undefined) {
      return delayAbortResult;
    }
  }

  return undefined;
};

/**
 * When `signal` is already aborted, builds the terminal `{ ok: false }` object
 * with a normalized `AbortError` on `error`.
 *
 * @param signal - Optional abort signal; only acts when `aborted` is set.
 * @param attempts - Number of finished attempts to report in the result.
 * @returns Failure result or `undefined` if not aborted.
 */
const buildAbortResult = (
  signal: AbortSignal | undefined,
  attempts: number
): RetryRunResult<never> | undefined => {
  if (signal?.aborted !== true) {
    return undefined;
  }

  return {
    attempts,
    error: toAbortError(signal.reason),
    ok: false,
  };
};

/**
 * Awaits inter-attempt delay in result mode, mapping an abort during wait to
 * a terminal result instead of throwing when `throwOnExhausted` is false.
 *
 * @param sleep - Custom or default sleep implementation.
 * @param delayMs - Milliseconds to wait.
 * @param signal - If set, `sleep` is raced with the abort signal.
 * @param attempts - Attempt count to attach if the wait ends in abort.
 * @returns A terminal result when canceled during the wait, otherwise
 *   `undefined`.
 * @throws {Error} The underlying `sleep` rejection when it is not an abort.
 */
const waitForDelay = async (
  sleep: (delayMs: number) => Promise<void>,
  delayMs: number,
  signal: AbortSignal | undefined,
  attempts: number
): Promise<RetryRunResult<never> | undefined> => {
  if (signal === undefined) {
    await sleep(delayMs);
    return undefined;
  }

  try {
    await sleepWithAbortSignal(sleep, delayMs, signal);
    return undefined;
  } catch (error) {
    const aborted = buildAbortResult(signal, attempts);
    if (aborted !== undefined) {
      return aborted;
    }
    throw error;
  }
};
