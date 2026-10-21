import { useEffect, useState } from "react";

/**
 * Debounces `value`. The value this hook returns lags behind `value` and
 * only updates once `value` stops changing for `delayMs`. Unlike
 * `useDebounce`, which debounces a function, this hook debounces a value
 * directly. Useful for cases like "only search again once the user stops
 * typing", without writing a separate handler function.
 *
 * @example
 * ```tsx
 * const debouncedQuery = useDebouncedValue(query, 300);
 * useEffect(() => { fetchResults(debouncedQuery); }, [debouncedQuery]);
 * ```
 */
export const useDebouncedValue = <T>(value: T, delayMs: number): T => {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = setTimeout(setDebounced, delayMs, value);
    return () => clearTimeout(id);
  }, [value, delayMs]);

  return debounced;
};
