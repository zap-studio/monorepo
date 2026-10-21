import { useMediaQueryMatch } from "../sensors/_media-query.ts";

/**
 * Returns `true` when the app runs in standalone display mode, meaning it
 * was launched from a home screen icon or installed as a PWA. It checks
 * this with the `(display-mode: standalone)` media query. Returns `false`
 * in a normal browser tab, during server rendering, and before the client
 * subscribes.
 *
 * @example
 * ```tsx
 * const isStandalone = useStandaloneMode();
 * ```
 */
export const useStandaloneMode = (): boolean => useMediaQueryMatch("(display-mode: standalone)");
