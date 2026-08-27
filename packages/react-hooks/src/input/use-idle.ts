import { useEffect, useState } from "react";

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

  // react-doctor-disable-next-line react-doctor/effect-needs-cleanup -- cleanup is returned below: clearTimeout(timer) plus removeEventListener for every ACTIVITY_EVENTS entry.
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    const resetTimer = () => {
      setIdle(false);
      clearTimeout(timer);
      timer = setTimeout(setIdle, timeoutMs, true);
    };

    for (const type of ACTIVITY_EVENTS) {
      window.addEventListener(type, resetTimer);
    }
    timer = setTimeout(setIdle, timeoutMs, true);

    return () => {
      clearTimeout(timer);
      for (const type of ACTIVITY_EVENTS) {
        window.removeEventListener(type, resetTimer);
      }
    };
  }, [timeoutMs]);

  return idle;
};
