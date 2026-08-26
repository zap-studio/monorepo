import { useEffect, useRef } from "react";

/** The shape returned by `usePerformanceObserver`. */
export interface UsePerformanceObserverResult {
  supported: boolean;
}

const isSupported = (): boolean => typeof PerformanceObserver !== "undefined";

/**
 * Wraps `PerformanceObserver`. It streams performance entries — like long
 * tasks, paint timing, and layout shifts — to `callback` as they happen.
 * The hook subscribes on mount, and again whenever `options` changes,
 * disconnecting the old observer first. Neither `callback` nor `options`
 * needs to be memoized. The hook always calls the latest `callback`
 * without re-subscribing, and it compares `options` field by field. This
 * means you can pass a new object literal on every render without
 * rebuilding the observer — which matters, because with `buffered: true`,
 * rebuilding it would re-deliver every past entry again.
 * Returns `supported: false` when `PerformanceObserver` doesn't exist,
 * such as during server rendering.
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
