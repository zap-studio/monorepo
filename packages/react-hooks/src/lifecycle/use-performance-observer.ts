import { useEffect, useRef } from "react";

/** The shape returned by `usePerformanceObserver`. */
export interface UsePerformanceObserverResult {
  supported: boolean;
}

const isSupported = (): boolean => typeof PerformanceObserver !== "undefined";

/**
 * Wraps `PerformanceObserver` — long tasks, paint timing, layout shift,
 * and other performance entry types, streamed to `callback` as they
 * happen. Subscribes on mount and whenever `options` changes,
 * disconnecting the previous observer first. Neither `callback` nor
 * `options` needs to be memoized — the latest `callback` is always called
 * without re-subscribing, and `options` is compared field by field, so an
 * object literal written inline at the call site doesn't rebuild the
 * observer on every render (which, with `buffered: true`, would re-deliver
 * the whole entry buffer each time).
 * `supported: false` — the SSR-safe default — where `PerformanceObserver`
 * doesn't exist.
 *
 * @example
 * ```tsx
 * usePerformanceObserver((list) => {
 *   for (const entry of list.getEntries()) reportLongTask(entry);
 * }, { entryTypes: ["longtask"] });
 * ```
 */
export const usePerformanceObserver = (
  callback: PerformanceObserverCallback,
  options: PerformanceObserverInit,
): UsePerformanceObserverResult => {
  const supported = isSupported();
  const callbackRef = useRef(callback);
  const optionsRef = useRef(options);
  useEffect(() => {
    callbackRef.current = callback;
    optionsRef.current = options;
  });

  const { buffered, entryTypes, type } = options;
  const entryTypesKey = entryTypes?.join(",");

  useEffect(() => {
    if (!isSupported()) {
      return undefined;
    }
    const observer = new PerformanceObserver((list, obs) => callbackRef.current(list, obs));
    observer.observe(optionsRef.current);
    return () => observer.disconnect();
  }, [buffered, entryTypesKey, type]);

  return { supported };
};
