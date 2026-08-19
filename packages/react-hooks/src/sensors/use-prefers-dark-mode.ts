import { useMediaQueryMatch } from "./_media-query.ts";

/**
 * `true` when the OS/browser prefers dark mode, via `(prefers-color-scheme:
 * dark)`. `false` during server rendering and before the client subscribes
 * to `matchMedia`.
 *
 * @example
 * ```tsx
 * const prefersDark = usePrefersDarkMode();
 * ```
 */
export const usePrefersDarkMode = (): boolean => useMediaQueryMatch("(prefers-color-scheme: dark)");
