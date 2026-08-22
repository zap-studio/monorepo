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
  // SAFETY: Performance.getEntriesByType's return type isn't narrowed by the "navigation" string literal in TypeScript's DOM lib, but the Navigation Timing spec guarantees every entry it returns for that type is a PerformanceNavigationTiming.
  const [entry] = performance.getEntriesByType("navigation") as PerformanceNavigationTiming[];
  return entry?.type ?? FALLBACK_NAVIGATION_TYPE;
};

const getServerSnapshot = (): NavigationEntryType => FALLBACK_NAVIGATION_TYPE;

const subscribe = () => () => {};

/**
 * Classifies how the current page was reached — `"navigate"` (a fresh
 * link/URL-bar navigation), `"reload"`, `"back_forward"` (browser
 * back/forward), or `"prerender"` — via the Navigation Timing API's
 * `performance.getEntriesByType("navigation")[0].type`. This value is
 * fixed once for the page's entire lifetime, unlike `usePopState`, which
 * only ever fires for back/forward transitions *after* mount. Falls back
 * to `"navigate"` during server rendering and where the Navigation Timing
 * API is unsupported.
 *
 * @example
 * ```tsx
 * const navigationType = useNavigationType();
 * if (navigationType === "reload") restoreScrollPosition();
 * ```
 */
export const useNavigationType = (): NavigationEntryType =>
  useSyncExternalStore(subscribe, readNavigationType, getServerSnapshot);
