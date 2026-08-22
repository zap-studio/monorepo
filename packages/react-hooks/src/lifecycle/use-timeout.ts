import { useEffect, useRef } from "react";

/**
 * Declarative `setTimeout` — schedules `callback` after `delayMs`,
 * clearing and rescheduling when `delayMs` changes, and clearing on
 * unmount. Pass `delayMs: null` to pause without unmounting the hook.
 * `callback` doesn't need to be memoized — the latest one is always
 * called, without resetting the timer.
 *
 * @example
 * ```tsx
 * useTimeout(() => setShowTooltip(false), showTooltip ? 3000 : null);
 * ```
 */
export const useTimeout = (callback: () => void, delayMs: number | null): void => {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    if (delayMs === null) {
      return undefined;
    }
    const id = setTimeout(() => callbackRef.current(), delayMs);
    return () => clearTimeout(id);
  }, [delayMs]);
};
