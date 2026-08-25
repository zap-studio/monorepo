import { useCallback, useEffect, useRef } from "react";

/**
 * Returns a throttled wrapper around `callback` — the first call runs
 * immediately (leading edge), and further calls are dropped until
 * `delayMs` has passed since that call. Unlike `useDebounce`, calls made
 * during the cooldown are discarded rather than queued for later.
 * `callback` doesn't need to be memoized — the latest one is always
 * called.
 *
 * @example
 * ```tsx
 * const throttledScroll = useThrottle(() => trackScrollDepth(), 1000);
 * window.addEventListener("scroll", throttledScroll);
 * ```
 */
export const useThrottle = <Args extends unknown[]>(
  callback: (...args: Args) => void,
  delayMs: number,
): ((...args: Args) => void) => {
  const callbackRef = useRef(callback);
  useEffect(() => {
    callbackRef.current = callback;
  });
  const coolingDownRef = useRef(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    },
    [],
  );

  return useCallback(
    (...args: Args): void => {
      if (coolingDownRef.current) {
        return;
      }
      callbackRef.current(...args);
      coolingDownRef.current = true;
      timeoutRef.current = setTimeout(() => {
        coolingDownRef.current = false;
        timeoutRef.current = null;
      }, delayMs);
    },
    [delayMs],
  );
};
