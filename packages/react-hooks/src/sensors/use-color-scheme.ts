import { useMediaQueryMatch } from "./_media-query.ts";

/** The OS/browser color scheme preference, as reported by `useColorScheme`. */
export type ColorScheme = "dark" | "light";

/**
 * The OS/browser color scheme preference, via `(prefers-color-scheme:
 * dark)`. Defaults to `"light"` during server rendering and before the
 * client subscribes to `matchMedia`.
 *
 * @example
 * ```tsx
 * const scheme = useColorScheme(); // "dark" | "light"
 * ```
 */
export const useColorScheme = (): ColorScheme =>
  useMediaQueryMatch("(prefers-color-scheme: dark)") ? "dark" : "light";
