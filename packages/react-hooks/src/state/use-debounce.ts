import { useCallback, useEffect, useRef } from "react";

/**
 * Returns a debounced wrapper around `callback` — each call resets a
 * `delayMs` timer, so `callback` only actually runs once calls stop
 * arriving for `delayMs`, with the most recent call's arguments. Pending
 * calls are cleared on unmount. `callback` doesn't need to be memoized —
 * the latest one is always called.
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
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => callbackRef.current(...args), delayMs);
    },
    [delayMs],
  );
};
