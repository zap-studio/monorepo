import { useEffect, useRef, useState } from "react";

/**
 * Throttles `value` — updates immediately on the first change after mount
 * (leading edge), then at most once per `delayMs` after that, always
 * eventually reflecting the latest value once the cooldown elapses.
 * Unlike `useDebouncedValue`, the first change in a burst is reflected
 * right away rather than waiting out the full delay.
 *
 * @example
 * ```tsx
 * const throttledScrollY = useThrottledValue(scrollY, 200);
 * ```
 */
export const useThrottledValue = <T>(value: T, delayMs: number): T => {
  const [throttled, setThrottled] = useState(value);
  const isFirstRef = useRef(true);
  const lastUpdateRef = useRef(0);

  useEffect(() => {
    if (isFirstRef.current) {
      isFirstRef.current = false;
      return undefined;
    }

    const elapsed = Date.now() - lastUpdateRef.current;

    if (elapsed >= delayMs) {
      lastUpdateRef.current = Date.now();
      setThrottled(value);
      return undefined;
    }

    const id = setTimeout(() => {
      lastUpdateRef.current = Date.now();
      setThrottled(value);
    }, delayMs - elapsed);
    return () => clearTimeout(id);
  }, [value, delayMs]);

  return throttled;
};
