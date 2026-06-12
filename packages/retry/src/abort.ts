/**
 * Abort-signal helpers for retry orchestration internals.
 *
 * @module @zap-studio/retry/abort
 */

import { AbortError } from "./errors.js";

/**
 * Throws when the provided abort signal is already aborted.
 *
 * @param signal - Optional abort signal to inspect.
 * @throws {AbortError} When the signal is aborted.
 */
export function throwIfAborted(signal?: AbortSignal): void {
  if (!signal?.aborted) {
    return;
  }

  throw toAbortError(signal.reason);
}

/**
 * Converts an abort reason into a normalized `AbortError`.
 *
 * @param reason - Arbitrary abort reason value.
 * @returns Normalized abort error instance.
 */
export function toAbortError(reason: unknown): AbortError {
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
}

/**
 * Waits for delay sleep while observing cancellation through an abort signal.
 *
 * @param sleep - Sleep function used to await `delayMs`.
 * @param delayMs - Delay duration in milliseconds.
 * @param signal - Abort signal to observe while waiting.
 * @returns Promise that resolves when delay finishes.
 * @throws {AbortError} When the signal aborts before or during wait.
 */
export async function sleepWithAbortSignal(
  sleep: (delayMs: number) => Promise<void>,
  delayMs: number,
  signal: AbortSignal
): Promise<void> {
  if (signal.aborted) {
    throw toAbortError(signal.reason);
  }

  let onAbort: (() => void) | undefined;

  try {
    await Promise.race([
      sleep(delayMs),
      new Promise<never>((_, reject) => {
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
}
