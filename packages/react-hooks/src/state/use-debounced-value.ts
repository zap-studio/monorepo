import { useEffect, useState } from "react";

/**
 * Debounces `value` — the returned value lags behind `value` by
 * `delayMs`, only updating once `value` stops changing for that long.
 * Unlike `useDebounce` (which debounces a callback), this debounces a
 * value directly, for cases like "only re-run search once typing pauses"
 * without needing a separate handler function.
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
