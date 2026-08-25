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
 * disconnecting the previous observer first. `callback` doesn't need to
 * be memoized — the latest one is always called, without re-subscribing.
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
  useEffect(() => {
    callbackRef.current = callback;
  });

  useEffect(() => {
    if (!isSupported()) {
      return undefined;
    }
    const observer = new PerformanceObserver((list, obs) => callbackRef.current(list, obs));
    observer.observe(options);
    return () => observer.disconnect();
  }, [options]);

  return { supported };
};
