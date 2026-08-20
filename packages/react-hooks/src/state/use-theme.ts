import { useMediaQueryMatch } from "../sensors/_media-query.ts";
import { useWebStorage } from "./_web-storage.ts";

/** The persisted theme mode `useTheme` tracks. */
export type ThemeMode = "dark" | "light" | "system";

/** The OS/browser color scheme a `"system"` theme mode resolves to. */
export type ResolvedTheme = "dark" | "light";

/** The shape returned by `useTheme`. */
export interface UseThemeResult {
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: ThemeMode) => void;
  theme: ThemeMode;
}

const STORAGE_KEY = "zap-studio-theme";

const getLocalStorage = (): Storage => window.localStorage;

/**
 * `"light"`/`"dark"`/`"system"` theme mode with persistence (via
 * `localStorage`, syncing across tabs), layered on the same
 * `prefers-color-scheme` reading `useColorScheme` uses for the
 * `"system"` case. Distinct from `useColorScheme`: that hook only ever
 * reports the OS's actual current preference — no third state is
 * possible from `prefers-color-scheme` alone — while this hook
 * additionally tracks a stored user override and falls back to the OS
 * reading when `theme` is `"system"`. `resolvedTheme` is always
 * `"light"` | `"dark"` — the OS reading when `theme` is `"system"`,
 * otherwise `theme` itself.
 *
 * @example
 * ```tsx
 * const { theme, resolvedTheme, setTheme } = useTheme();
 * document.documentElement.dataset.theme = resolvedTheme;
 * <button onClick={() => setTheme("dark")}>Dark</button>
 * ```
 */
export const useTheme = (): UseThemeResult => {
  const [theme, setTheme] = useWebStorage<ThemeMode>(getLocalStorage, STORAGE_KEY, "system");
  const prefersDark = useMediaQueryMatch("(prefers-color-scheme: dark)");

  const osTheme: ResolvedTheme = prefersDark ? "dark" : "light";
  const resolvedTheme: ResolvedTheme = theme === "system" ? osTheme : theme;

  return { resolvedTheme, setTheme, theme };
};
