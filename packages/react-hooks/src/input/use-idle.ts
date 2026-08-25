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
 * `true` once `timeoutMs` (default 60s) has passed without user activity
 * (mouse move/click, key press, touch, scroll, wheel), resetting to `false`
 * on the next activity. SSR-safe — returns `false` on the server and until
 * the first timeout elapses on the client.
 *
 * @example
 * ```tsx
 * const isIdle = useIdle(5 * 60_000); // idle after 5 minutes
 * ```
 */
export const useIdle = (timeoutMs: number = DEFAULT_TIMEOUT_MS): boolean => {
  const [idle, setIdle] = useState(false);

  // oxlint-disable-next-line react-doctor/effect-needs-cleanup -- the returned cleanup already clears the shared `timer` (every reassignment inside resetTimer included, since it's the same closed-over variable) and removes every activity listener.
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
