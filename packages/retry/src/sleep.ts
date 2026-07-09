/**
 * Default delay implementation used by `BaseRetryPolicy.run` when no custom
 * `sleep` is provided.
 *
 * @module @zap-studio/retry/sleep
 */

/**
 * Awaits a timer-based delay, unless `delayMs` is non-positive.
 *
 * @param delayMs - Milliseconds to wait before resolving.
 * @returns Promise that resolves when the delay completes.
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
