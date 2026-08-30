import { useCallback, useEffect, useRef, useState } from "react";

const DEFAULT_TIMEOUT_MS = 60_000;

const ACTIVITY_EVENTS = [
  "mousemove",
  "mousedown",
  "keydown",
  "touchstart",
  "scroll",
  "wheel",
] as const;

/**
 * Returns `true` once `timeoutMs` (default 60 seconds) has passed with no
 * user activity — mouse move, click, key press, touch, scroll, or wheel.
 * Goes back to `false` on the next activity.
 *
 * Safe for server-side rendering: returns `false` on the server, and
 * stays `false` on the client until the first timeout passes.
 *
 * @example
 * ```tsx
 * const isIdle = useIdle(5 * 60_000); // idle after 5 minutes
 * ```
 */
export const useIdle = (timeoutMs: number = DEFAULT_TIMEOUT_MS): boolean => {
  const [idle, setIdle] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const scheduleTimeout = useCallback(() => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(setIdle, timeoutMs, true);
  }, [timeoutMs]);

  const resetTimer = useCallback(() => {
    setIdle(false);
    scheduleTimeout();
  }, [scheduleTimeout]);

  useEffect(() => {
    scheduleTimeout();
    return () => clearTimeout(timerRef.current);
  }, [scheduleTimeout]);

  useEffect(() => {
    for (const type of ACTIVITY_EVENTS) {
      window.addEventListener(type, resetTimer);
    }

    return () => {
      for (const type of ACTIVITY_EVENTS) {
        window.removeEventListener(type, resetTimer);
      }
    };
  }, [resetTimer]);

  return idle;
};
