import { useCallback, useEffect, useRef } from "react";

/**
 * Returns a throttled version of `callback`. The first call runs right
 * away. After that, calls are ignored until `delayMs` has passed. Unlike
 * `useDebounce`, calls made during that cooldown are dropped, not saved
 * for later. You don't need to memoize `callback` — the latest version is
 * always used.
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
