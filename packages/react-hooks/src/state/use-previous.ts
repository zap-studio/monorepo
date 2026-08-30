import { useEffect, useRef } from "react";

/**
 * Returns `value` from the previous render. On the first render, there is
 * no previous value yet, so it returns `undefined`. It updates after
 * every render using an effect, so it always reflects the last completed
 * render, not the one happening right now.
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

  // oxlint-disable-next-line react/refs -- reading the ref during render is the point: it holds the value from the last completed render, which cannot be derived from the current one.
  return ref.current;
};
