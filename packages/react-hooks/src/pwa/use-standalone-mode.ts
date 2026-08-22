import { useMediaQueryMatch } from "../sensors/_media-query.ts";

/**
 * `true` when the app is running in standalone display mode — launched from
 * a home screen icon or otherwise installed as a PWA — via the
 * `(display-mode: standalone)` media query. `false` in an ordinary browser
 * tab, during server rendering, and before the client subscribes.
 *
 * @example
 * ```tsx
 * const isStandalone = useStandaloneMode();
 * ```
 */
export const useStandaloneMode = (): boolean => useMediaQueryMatch("(display-mode: standalone)");
