import { useSyncExternalStore } from "react";

/** The classification `useNavigationType` returns. */
export type NavigationEntryType = "back_forward" | "navigate" | "prerender" | "reload";

const FALLBACK_NAVIGATION_TYPE: NavigationEntryType = "navigate";

const isSupported = (): boolean =>
  typeof performance !== "undefined" && typeof performance.getEntriesByType === "function";

const readNavigationType = (): NavigationEntryType => {
  if (!isSupported()) {
    return FALLBACK_NAVIGATION_TYPE;
  }
  // SAFETY: getEntriesByType("navigation") isn't narrowed to the right type, but the spec guarantees every entry returned for "navigation" is a PerformanceNavigationTiming.
  const [entry] = performance.getEntriesByType("navigation") as PerformanceNavigationTiming[];
  return entry?.type ?? FALLBACK_NAVIGATION_TYPE;
};

const getServerSnapshot = (): NavigationEntryType => FALLBACK_NAVIGATION_TYPE;

const subscribe = () => () => {};

/**
 * Tells you how the current page was reached: `"navigate"` (a fresh link
 * or URL-bar navigation), `"reload"`, `"back_forward"` (browser back or
 * forward button), or `"prerender"`. It reads this from the Navigation
 * Timing API. This value is set once and never changes during the page's
 * lifetime. This is different from `usePopState`, which only fires for
 * back/forward navigation that happens after the component mounts. Falls
 * back to `"navigate"` during server rendering, or if the Navigation
 * Timing API isn't supported.
 *
 * @example
 * ```tsx
 * const navigationType = useNavigationType();
 * if (navigationType === "reload") restoreScrollPosition();
 * ```
 */
export const useNavigationType = (): NavigationEntryType =>
  useSyncExternalStore(subscribe, readNavigationType, getServerSnapshot);
