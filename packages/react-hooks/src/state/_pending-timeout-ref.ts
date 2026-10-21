import { type RefObject, useEffect, useRef } from "react";

/**
 * A ref for a pending `setTimeout` id, cleared automatically on unmount.
 * Backs `useDebounce`/`useThrottle` — callers are still responsible for
 * clearing/replacing `.current` themselves as their own timer fires.
 */
export const usePendingTimeoutRef = (): RefObject<ReturnType<typeof setTimeout> | null> => {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    },
    [],
  );

  return timeoutRef;
};
