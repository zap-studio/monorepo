/**
 * `Navigation`, `NavigateEvent`, and `NavigationHistoryEntry` are ambient
 * global types for the Navigation API — used bare, no import needed.
 */

/**
 * Shared helper that reads `window.navigation`. Both `useNavigation` and
 * `useNavigationBlocker` use this; it lives here instead of a hook file
 * because hook files should never import from each other.
 *
 * The Navigation API only works in Chromium browsers (Chrome, Edge) —
 * Safari and Firefox leave `window.navigation` `undefined` at runtime, so
 * this function's return type widens back to `Navigation | undefined`.
 *
 * Only ever called in the browser, never during server rendering, so it
 * doesn't need its own `typeof window === "undefined"` check.
 */
export const getNavigation = (): Navigation | undefined => window.navigation;
