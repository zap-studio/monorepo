import { useEffect, useRef } from "react";

/**
 * Returns `value` as it was during the previous render — `undefined` on
 * the first render, before there is one. Updates after every render, via
 * an effect (so the value returned always reflects the previously
 * *committed* render, not the one currently in progress).
 *
 * @example
 * ```tsx
 * const previousCount = usePrevious(count);
 * const delta = previousCount === undefined ? 0 : count - previousCount;
 * ```
 */
export const usePrevious = <T>(value: T): T | undefined => {
  const ref = useRef<T | undefined>(undefined);

  useEffect(() => {
    ref.current = value;
  });

  return ref.current;
};
