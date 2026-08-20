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
 * Wraps the Navigation API's `window.navigation` — `currentEntry`,
 * `entries()`, `canGoBack`/`canGoForward` — updating on its
 * `currententrychange` event, which fires for both same-document and
 * cross-document navigations the API observes (a superset of
 * `usePopState`'s `popstate`, which only ever fires for back/forward).
 * Falls back to `{ canGoBack: false, canGoForward: false, currentEntry:
 * null, entries: [] }` — the SSR-safe default — during server
 * rendering and permanently in browsers without the Navigation API
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
