/** Minimal shape of the Navigation API's `NavigationHistoryEntry`. */
export interface NavigationHistoryEntry {
  readonly url: string;
}

/** Minimal shape of the Navigation API's `NavigationDestination`. */
export interface NavigationDestination {
  readonly url: string;
}

/** Minimal shape of the Navigation API's `NavigateEvent`. */
export interface NavigateEvent extends Event {
  readonly canIntercept: boolean;
  readonly destination: NavigationDestination;
  readonly downloadRequest: string | null;
  readonly hashChange: boolean;
  intercept(options: { handler: () => Promise<void> }): void;
}

/** Minimal shape of the Navigation API's `window.navigation`. */
export interface Navigation extends EventTarget {
  readonly canGoBack: boolean;
  readonly canGoForward: boolean;
  readonly currentEntry: NavigationHistoryEntry | null;
  entries(): NavigationHistoryEntry[];
}

/**
 * Shared `window.navigation` (Navigation API) accessor behind `useNavigation`
 * and `useNavigationBlocker`. Not itself a public hook — hook files never
 * import one another, so shared logic lives here (mirrors `@zap-studio/retry`'s
 * `_otel.ts` convention).
 *
 * The Navigation API is Chromium-only, and different supported TypeScript
 * versions disagree on whether (and how) `Window.navigation` is declared —
 * some don't declare it at all, others declare it as always-present. Casting
 * `window` to a small local shape (rather than an `interface extends
 * Window`) sidesteps both: it doesn't inherit — and so can't conflict with —
 * whatever `Window.navigation` typing a given lib.dom.d.ts snapshot has.
 *
 * Only ever called client-side — from `useSyncExternalStore`'s `getSnapshot`
 * (never `getServerSnapshot`) and from inside `useEffect` — so, unlike a
 * public hook, this doesn't need its own `typeof window === "undefined"`
 * guard for SSR.
 */
export const getNavigation = (): Navigation | undefined =>
  // SAFETY: window.navigation is read as optional here regardless of how (or whether) the resolved TypeScript version's DOM lib declares it, so a browser where it's genuinely absent (Safari, Firefox) degrades to undefined rather than throwing.
  (window as { navigation?: Navigation }).navigation;
