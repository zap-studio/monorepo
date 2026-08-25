import { useEffect, useRef } from "react";

/**
 * Declarative `setInterval` — calls `callback` every `delayMs`, restarting
 * when `delayMs` changes, and clearing on unmount. Pass `delayMs: null` to
 * pause without unmounting the hook. `callback` doesn't need to be
 * memoized — the latest one is always called, without resetting the
 * interval.
 *
 * @example
 * ```tsx
 * useInterval(() => setElapsed((s) => s + 1), running ? 1000 : null);
 * ```
 */
export const useInterval = (callback: () => void, delayMs: number | null): void => {
  const callbackRef = useRef(callback);
  useEffect(() => {
    callbackRef.current = callback;
  });

  useEffect(() => {
    if (delayMs === null) {
      return undefined;
    }
    const id = setInterval(() => callbackRef.current(), delayMs);
    return () => clearInterval(id);
  }, [delayMs]);
};
