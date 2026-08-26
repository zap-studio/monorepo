import { useCallback, useRef, useSyncExternalStore } from "react";

import { getNavigation, type NavigationHistoryEntry } from "./_navigation-api.ts";

/** The shape returned by `useNavigation`. */
export interface NavigationSnapshot {
  canGoBack: boolean;
  canGoForward: boolean;
  currentEntry: NavigationHistoryEntry | null;
  entries: readonly NavigationHistoryEntry[];
}

const FALLBACK_NAVIGATION: NavigationSnapshot = {
  canGoBack: false,
  canGoForward: false,
  currentEntry: null,
  entries: [],
};

const readNavigation = (): NavigationSnapshot => {
  const nav = getNavigation();
  if (!nav) {
    return FALLBACK_NAVIGATION;
  }
  return {
    canGoBack: nav.canGoBack,
    canGoForward: nav.canGoForward,
    currentEntry: nav.currentEntry,
    entries: nav.entries(),
  };
};

const navigationsEqual = (a: NavigationSnapshot, b: NavigationSnapshot): boolean =>
  a.canGoBack === b.canGoBack &&
  a.canGoForward === b.canGoForward &&
  a.currentEntry === b.currentEntry &&
  a.entries.length === b.entries.length &&
  a.entries.every((entry, index) => entry === b.entries[index]);

const getServerSnapshot = (): NavigationSnapshot => FALLBACK_NAVIGATION;

const subscribe = (onStoreChange: () => void) => {
  const nav = getNavigation();
  if (!nav) {
    return () => {};
  }
  nav.addEventListener("currententrychange", onStoreChange);
  return () => nav.removeEventListener("currententrychange", onStoreChange);
};

/**
 * Wraps `window.navigation` from the Navigation API, giving you
 * `currentEntry`, `entries()`, `canGoBack`, and `canGoForward`. It updates
 * on the `currententrychange` event, which fires for more kinds of
 * navigation than `usePopState`'s `popstate` event does (that one only
 * fires for browser back/forward). Falls back to `{ canGoBack: false,
 * canGoForward: false, currentEntry: null, entries: [] }` during server
 * rendering, and permanently in browsers without the Navigation API
 * (Safari, Firefox).
 *
 * @example
 * ```tsx
 * const { canGoBack, currentEntry } = useNavigation();
 * if (canGoBack) window.navigation?.back();
 * ```
 */
export const useNavigation = (): NavigationSnapshot => {
  const cacheRef = useRef<NavigationSnapshot>(FALLBACK_NAVIGATION);

  const getSnapshot = useCallback((): NavigationSnapshot => {
    const next = readNavigation();
    if (!navigationsEqual(cacheRef.current, next)) {
      cacheRef.current = next;
    }
    return cacheRef.current;
  }, []);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
};
