import { useEffect } from "react";

import { useLatestRef } from "./_latest-ref.ts";

/**
 * A `setInterval` wrapper for React. Calls `callback` every `delayMs`
 * milliseconds. It restarts the timer when `delayMs` changes, and clears
 * it when the component unmounts. Pass `delayMs: null` to pause without
 * unmounting the hook. You don't need to memoize `callback` — the hook
 * always uses the latest version, without resetting the timer.
 *
 * @example
 * ```tsx
 * useInterval(() => setElapsed((s) => s + 1), running ? 1000 : null);
 * ```
 */
export const useInterval = (callback: () => void, delayMs: number | null): void => {
  const callbackRef = useLatestRef(callback);

  useEffect(() => {
    if (delayMs === null) {
      return undefined;
    }
    const id = setInterval(() => callbackRef.current(), delayMs);
    return () => clearInterval(id);
  }, [delayMs]);
};
