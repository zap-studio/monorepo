import { useCallback, useState } from "react";

/** Options accepted by `useCounter`. */
export interface UseCounterOptions {
  max?: number;
  min?: number;
}

/** The shape returned by `useCounter`. */
export interface UseCounterResult {
  count: number;
  decrement: (step?: number) => void;
  increment: (step?: number) => void;
  reset: () => void;
  set: (value: number) => void;
}

/**
 * Numeric counter state with `increment()`/`decrement()` (step defaults
 * to `1`), `set()`, and `reset()` (back to `initialValue`). If you pass
 * `min` or `max`, the value is kept inside that range, including
 * `initialValue` itself.
 *
 * @example
 * ```tsx
 * const { count, increment, decrement, reset } = useCounter(0, { min: 0, max: 10 });
 * ```
 */
export const useCounter = (initialValue = 0, options: UseCounterOptions = {}): UseCounterResult => {
  const { max, min } = options;

  const clamp = useCallback(
    (value: number): number => {
      let next = value;
      if (min !== undefined) {
        next = Math.max(min, next);
      }
      if (max !== undefined) {
        next = Math.min(max, next);
      }
      return next;
    },
    [min, max],
  );

  const [count, setCount] = useState(() => clamp(initialValue));

  const increment = useCallback((step = 1) => setCount((prev) => clamp(prev + step)), [clamp]);
  const decrement = useCallback((step = 1) => setCount((prev) => clamp(prev - step)), [clamp]);
  const set = useCallback((value: number) => setCount(clamp(value)), [clamp]);
  const reset = useCallback(() => setCount(clamp(initialValue)), [clamp, initialValue]);

  return { count, decrement, increment, reset, set };
};
