/**
 * Retry runner base class and shared orchestration implementation.
 *
 * @module @zap-studio/retry/base-policy
 */

import { AbortError, RetryError } from "./errors.js";
import type {
  ResolvedRetryPolicy,
  RetryExhaustedInput,
  RetryPolicy,
  RetryRunOptions,
  RetryRunResult,
} from "./types.js";

/**
 * Awaits a timer-based delay, unless `delayMs` is non-positive.
 *
 * @param delayMs - Milliseconds to wait before resolving.
 * @returns Promise that resolves when the delay completes.
 *
 * @example
 * ```ts
 * import { defaultSleep } from "@zap-studio/retry";
 *
 * await defaultSleep(250); // waits 250ms
 * ```
 */
export const defaultSleep = async (delayMs: number): Promise<void> => {
  if (delayMs <= 0) {
    return;
  }

  // oxlint-disable-next-line promise/avoid-new -- Timer sleep requires adapting callback API to a promise.
  await new Promise<void>((resolve) => {
    setTimeout(resolve, delayMs);
  });
};

/**
 * Normalizes an abort `reason` into an `AbortError`.
 */
const toAbortError = (reason: unknown): AbortError => {
  if (reason instanceof AbortError) {
    return reason;
  }

  if (reason instanceof Error) {
    return new AbortError(reason.message, { cause: reason });
  }

  if (typeof reason === "string" && reason.length > 0) {
    return new AbortError(reason);
  }

  if (reason === undefined) {
    return new AbortError("Retry aborted.");
  }

  try {
    return new AbortError(`Retry aborted: ${JSON.stringify(reason)}`);
  } catch {
    return new AbortError("Retry aborted.");
  }
};

/**
 * Throws when the provided abort signal is already aborted.
 *
 * @param signal - Optional abort signal to inspect.
 * @throws {AbortError} When the signal is aborted.
 */
const throwIfAborted = (signal?: AbortSignal): void => {
  if (signal?.aborted !== true) {
    return;
  }

  throw toAbortError(signal.reason);
};

/**
 * Waits for delay sleep while observing cancellation through an abort signal.
 *
 * @param sleep - Sleep function used to await `delayMs`.
 * @param delayMs - Delay duration in milliseconds.
 * @param signal - Abort signal to observe while waiting.
 * @returns Promise that resolves when delay finishes.
 * @throws {AbortError} When the signal aborts before or during wait.
 */
const sleepWithAbortSignal = async (
  sleep: (delayMs: number) => Promise<void>,
  delayMs: number,
  signal: AbortSignal
): Promise<void> => {
  if (signal.aborted) {
    throw toAbortError(signal.reason);
  }

  let onAbort: (() => void) | undefined;

  try {
    await Promise.race([
      sleep(delayMs),
      // oxlint-disable-next-line promise/avoid-new -- AbortSignal callback is adapted into the race promise.
      new Promise<never>((_resolve, reject) => {
        onAbort = (): void => {
          reject(toAbortError(signal.reason));
        };

        signal.addEventListener("abort", onAbort, { once: true });
      }),
    ]);
  } finally {
    if (onAbort) {
      signal.removeEventListener("abort", onAbort);
    }
  }
};

/**
 * Runs the throw-mode retry loop: throws `RetryError` on exhaustion and
 * `AbortError` when `signal` aborts.
 *
 * @param policy - Resolved retry policy providing `next` and `onExhausted`.
 * @param execute - Async work callback per attempt.
 * @param sleep - Delay function between retries.
 * @param signal - Optional cancel signal.
 * @returns Resolves to the first successful return value.
 * @throws {RetryError} When retries are exhausted and `onExhausted` returns
 *   the terminal error.
 * @throws {AbortError} When `signal` is already aborted or aborts while waiting.
 * @throws {Error} Any error thrown by `next`, `onExhausted`, or `sleep`. Also
 *   rethrows the original caught value immediately, bypassing retry, when
 *   `policy.isKnownError` rejects it as outside this policy's error domain.
 */
const runThrowMode = async <T, TError extends Error, TData>(
  policy: ResolvedRetryPolicy<TError, TData>,
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

      if (!policy.isKnownError(error)) {
        throw error;
      }

      const decision = policy.next({
        attempt,
        error,
      });

      if (!decision.shouldRetry) {
        throw policy.onExhausted({
          attempts: attempt,
          error,
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

/**
 * After a failed attempt, applies abort rules, `next`, optional delay, and
 * either returns a terminal `RetryRunResult` or `undefined` to continue.
 *
 * @param policy - Resolved retry policy hooks (`next`, `onExhausted`).
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
const handleFailure = async <TError extends Error, TData>(
  policy: ResolvedRetryPolicy<TError, TData>,
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
 * Runs the non-throw retry loop, returning
 * `RetryRunResult`.
 *
 * @param policy - Resolved retry policy providing `next` and `onExhausted`.
 * @param execute - Async work callback per attempt.
 * @param sleep - Delay function between retries.
 * @param signal - Optional cancel signal.
 * @returns Terminal success or failure object. When `policy.isKnownError`
 *   rejects a caught value as outside this policy's error domain, the
 *   original value is wrapped in a `RetryError` and returned on
 *   `result.error` immediately, bypassing retry — never thrown.
 * @throws {Error} Any error thrown by `next`, `onExhausted`, or a non-abort `sleep`
 *   failure.
 */
const runResultMode = async <T, TError extends Error, TData>(
  policy: ResolvedRetryPolicy<TError, TData>,
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

    const attemptAbortResult = buildAbortResult(signal, attempt);
    if (attemptAbortResult !== undefined) {
      return attemptAbortResult;
    }

    if (!policy.isKnownError(execution.error)) {
      return {
        attempts: attempt,
        error: new RetryError("Retry policy encountered an unknown error.", {
          attempts: attempt,
          lastError: execution.error,
        }),
        ok: false,
      };
    }

    // oxlint-disable-next-line no-await-in-loop -- Failure handling belongs to the current sequential attempt.
    const failure = await handleFailure(policy, {
      attempt,
      error: execution.error,
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
 * Default `onExhausted` used when a policy omits it: wraps the exhaustion
 * context in a generic `RetryError`.
 */
const defaultOnExhausted = <TError extends Error, TData>(
  input: RetryExhaustedInput<TError, TData>
): RetryError =>
  new RetryError("Retry policy exhausted all attempts.", {
    attempts: input.attempts,
    lastData: input.data,
    lastError: input.error,
  });

/**
 * Default `isKnownError` used when a policy omits it: accepts any `Error`
 * instance and rejects everything else.
 */
// oxlint-disable-next-line typescript/no-unnecessary-type-parameters -- TError only appears in the return predicate; needed so callers infer the right narrowed type.
const defaultIsKnownError = <TError extends Error>(
  error: unknown
): error is TError => error instanceof Error;

/**
 * Runs retry orchestration in non-throw mode.
 *
 * @param policy - Retry policy: `next` is required, `onExhausted` and
 *   `isKnownError` fall back to their defaults when omitted.
 * @param execute - Async function to execute per attempt.
 * @param options - Runner settings with `throwOnExhausted: false`.
 * @returns A discriminated result union containing success value or terminal error.
 *   When `policy.isKnownError` rejects a caught value, it is wrapped in a
 *   `RetryError` and returned as the terminal failure instead of thrown.
 * @throws {Error} Any error thrown by `next`, `onExhausted`, or a custom `sleep`.
 */
export function runRetryPolicy<
  T,
  TError extends Error = Error,
  TData = unknown,
>(
  policy: RetryPolicy<TError, TData>,
  execute: (attempt: number) => Promise<T>,
  options: RetryRunOptions & { throwOnExhausted: false }
): Promise<RetryRunResult<T>>;

/**
 * Runs retry orchestration and throws terminal error on exhaustion.
 *
 * @param policy - Retry policy: `next` is required, `onExhausted` and
 *   `isKnownError` fall back to their defaults when omitted.
 * @param execute - Async function to execute per attempt.
 * @param options - Optional runner settings.
 * @returns The successful execution value.
 * @throws {RetryError} When retries are exhausted and `onExhausted` returns the
 *   terminal retry error. The default implementation returns `RetryError` with the last
 *   execution failure available on `RetryError.lastError`.
 * @throws {AbortError} When `options.signal` is already aborted or aborts while retrying.
 * @throws {Error} Any error thrown by `next`, by `onExhausted`, or by a custom `sleep`
 *   function.
 *
 * @example
 * ```ts
 * import { runRetryPolicy } from "@zap-studio/retry";
 * import type { RetryPolicy } from "@zap-studio/retry";
 *
 * const linearBackoff: RetryPolicy = {
 *   next: ({ attempt }) =>
 *     attempt < 3
 *       ? { shouldRetry: true, delayMs: attempt * 100, reason: "retry" }
 *       : { shouldRetry: false, delayMs: 0, reason: "max-attempts-reached" },
 * };
 *
 * const data = await runRetryPolicy(linearBackoff, async () => fetchFlakyResource());
 * ```
 */
export function runRetryPolicy<
  T,
  TError extends Error = Error,
  TData = unknown,
>(
  policy: RetryPolicy<TError, TData>,
  execute: (attempt: number) => Promise<T>,
  options?: RetryRunOptions & { throwOnExhausted?: true }
): Promise<T>;

/**
 * Runs retry orchestration in non-throw mode.
 *
 * When `throwOnExhausted` is `false`, returns a discriminated result union.
 *
 * @param policy - Retry policy: `next` is required, `onExhausted` and
 *   `isKnownError` fall back to their defaults when omitted.
 * @param execute - Async function to execute per attempt.
 * @param options - Runner settings.
 * @returns Success value or terminal result object based on option mode.
 * @throws {Error} Any error thrown by `next`, by `onExhausted`, or by a custom `sleep`
 *   function. When `throwOnExhausted` is `false`, exhaustion itself is returned
 *   as `{ ok: false }` instead of thrown.
 *   Cancellation is returned as `{ ok: false, error: AbortError }` in non-throw
 *   mode. A value rejected by `policy.isKnownError` is wrapped in a
 *   `RetryError` and returned the same way in non-throw mode; in throw mode
 *   it is rethrown as-is.
 *
 * @example
 * const result = await runRetryPolicy(policy, doWork, { throwOnExhausted: false });
 * if (!result.ok) console.error(result.error);
 */
export async function runRetryPolicy<
  T,
  TError extends Error = Error,
  TData = unknown,
>(
  policy: RetryPolicy<TError, TData>,
  execute: (attempt: number) => Promise<T>,
  options: RetryRunOptions = {}
): Promise<T | RetryRunResult<T>> {
  const sleep = options.sleep ?? defaultSleep;
  const { signal } = options;
  const resolvedPolicy: ResolvedRetryPolicy<TError, TData> = {
    isKnownError: policy.isKnownError ?? defaultIsKnownError,
    next: policy.next,
    onExhausted: policy.onExhausted ?? defaultOnExhausted,
  };

  if (options.throwOnExhausted === false) {
    return await runResultMode(resolvedPolicy, execute, sleep, signal);
  }

  return await runThrowMode(resolvedPolicy, execute, sleep, signal);
}
