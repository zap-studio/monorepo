import { useEffect } from "react";

import { useLatestRef } from "./_latest-ref.ts";

/**
 * A `setTimeout` wrapper for React. Runs `callback` once, after `delayMs`
 * milliseconds. It clears and restarts the timer when `delayMs` changes,
 * and clears it when the component unmounts. Pass `delayMs: null` to
 * pause without unmounting the hook. You don't need to memoize
 * `callback` — the hook always uses the latest version, without
 * resetting the timer.
 *
 * @example
 * ```tsx
 * useTimeout(() => setShowTooltip(false), showTooltip ? 3000 : null);
 * ```
 */
export const useTimeout = (callback: () => void, delayMs: number | null): void => {
  const callbackRef = useLatestRef(callback);

  useEffect(() => {
    if (delayMs === null) {
      return undefined;
    }
    const id = setTimeout(() => callbackRef.current(), delayMs);
    return () => clearTimeout(id);
  }, [callbackRef, delayMs]);
};
