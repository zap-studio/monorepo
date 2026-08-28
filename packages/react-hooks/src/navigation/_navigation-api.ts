/**
 * `Navigation`, `NavigateEvent`, and `NavigationHistoryEntry` below are all
 * TypeScript 7's own native DOM types for the Navigation API — used bare,
 * ambient, no import needed.
 */

/**
 * Shared helper that reads `window.navigation` (the Navigation API). Both
 * `useNavigation` and `useNavigationBlocker` use this function. It lives
 * here instead of in a hook file because hook files should never import
 * from each other.
 *
 * TypeScript 7's DOM lib declares `Window.navigation` as always present,
 * but the Navigation API only works in Chromium-based browsers (Chrome,
 * Edge) — Safari and Firefox leave it `undefined` at runtime regardless of
 * what the type says. This function's own return type widens back to
 * `Navigation | undefined` to match that.
 *
 * This function is only ever called in the browser, never during server
 * rendering. Because of that, it doesn't need its own check for
 * `typeof window === "undefined"` like a public hook would.
 */
export const getNavigation = (): Navigation | undefined => window.navigation;
