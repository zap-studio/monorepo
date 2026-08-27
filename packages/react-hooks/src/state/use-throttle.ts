import { useCallback, useRef } from "react";

import { useIsomorphicLayoutEffect } from "../lifecycle/use-isomorphic-layout-effect.ts";

import { usePendingTimeoutRef } from "./_pending-timeout-ref.ts";

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
  useIsomorphicLayoutEffect(() => {
    callbackRef.current = callback;
  });
  const coolingDownRef = useRef(false);
  const timeoutRef = usePendingTimeoutRef();

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
