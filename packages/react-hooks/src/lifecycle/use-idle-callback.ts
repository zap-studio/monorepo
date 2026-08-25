import { useEffect, useRef } from "react";

const FALLBACK_TIMEOUT_MS = 1;
const FALLBACK_TIME_REMAINING_MS = 50;

const isSupported = (): boolean => typeof requestIdleCallback === "function";

const requestIdle = (callback: IdleRequestCallback, options?: IdleRequestOptions): number => {
  if (isSupported()) {
    return requestIdleCallback(callback, options);
  }
  return window.setTimeout(
    () => callback({ didTimeout: false, timeRemaining: () => FALLBACK_TIME_REMAINING_MS }),
    FALLBACK_TIMEOUT_MS,
  );
};

const cancelIdle = (handle: number): void => {
  if (isSupported()) {
    cancelIdleCallback(handle);
    return;
  }
  clearTimeout(handle);
};

/**
 * Wraps `requestIdleCallback`/`cancelIdleCallback` — background scheduling
 * for low-priority work during a frame's idle time. Falls back to a
 * `setTimeout(fn, 1)` with a synthetic `{ didTimeout: false,
 * timeRemaining: () => 50 }` deadline on Safari, which never implemented
 * the real API. Pass `enabled: false` to pause without unmounting the
 * hook. Neither `callback` nor `options` needs to be memoized — the latest
 * `callback` is always called, and `options` is compared by its `timeout`
 * value rather than by identity.
 *
 * @example
 * ```tsx
 * useIdleCallback((deadline) => {
 *   while (deadline.timeRemaining() > 0 && queue.length > 0) processNext();
 * });
 * ```
 */
export const useIdleCallback = (
  callback: (deadline: IdleDeadline) => void,
  options?: IdleRequestOptions,
  enabled = true,
): void => {
  const callbackRef = useRef(callback);
  useEffect(() => {
    callbackRef.current = callback;
  });

  const timeout = options?.timeout;

  useEffect(() => {
    if (!enabled) {
      return undefined;
    }
    const handle = requestIdle(
      (deadline) => callbackRef.current(deadline),
      timeout === undefined ? undefined : { timeout },
    );
    return () => cancelIdle(handle);
  }, [enabled, timeout]);
};
