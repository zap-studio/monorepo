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
 * Shared helper that reads `window.navigation` (the Navigation API). Both
 * `useNavigation` and `useNavigationBlocker` use this function. It lives
 * here instead of in a hook file because hook files should never import
 * from each other.
 *
 * The Navigation API only works in Chromium-based browsers (like Chrome
 * and Edge), and different versions of TypeScript disagree on how to
 * declare `Window.navigation` — some don't declare it at all. Casting
 * `window` to a small local type here avoids conflicting with whatever
 * typing a given TypeScript version uses.
 *
 * This function is only ever called in the browser, never during server
 * rendering. Because of that, it doesn't need its own check for
 * `typeof window === "undefined"` like a public hook would.
 */
export const getNavigation = (): Navigation | undefined =>
  // SAFETY: window.navigation is read as an optional property here, no matter how TypeScript declares it. So in a browser that truly doesn't have it (Safari, Firefox), this returns undefined instead of throwing an error.
  (window as { navigation?: Navigation }).navigation;
