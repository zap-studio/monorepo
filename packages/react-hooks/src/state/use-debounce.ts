import { useCallback, useEffect, useRef } from "react";

import { usePendingTimeoutRef } from "./_pending-timeout-ref.ts";

/**
 * Returns a debounced version of `callback`. Each call restarts a
 * `delayMs` timer, so `callback` only runs once calls stop coming in for
 * `delayMs`. It then runs once, using the arguments from the most recent
 * call. Any pending call is canceled when the component unmounts. You
 * don't need to memoize `callback` — the latest version is always used.
 *
 * @example
 * ```tsx
 * const debouncedSearch = useDebounce((query: string) => fetchResults(query), 300);
 * <input onChange={(e) => debouncedSearch(e.target.value)} />
 * ```
 */
export const useDebounce = <Args extends unknown[]>(
  callback: (...args: Args) => void,
  delayMs: number,
): ((...args: Args) => void) => {
  const callbackRef = useRef(callback);
  useEffect(() => {
    callbackRef.current = callback;
  });
  const timeoutRef = usePendingTimeoutRef();

  return useCallback(
    (...args: Args): void => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => callbackRef.current(...args), delayMs);
    },
    [delayMs],
  );
};
