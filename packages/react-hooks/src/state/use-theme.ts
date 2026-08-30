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
 * Theme mode: `"light"`, `"dark"`, or `"system"`. The choice is saved in
 * `localStorage` and stays in sync across tabs. For the `"system"` case,
 * it uses the same `prefers-color-scheme` check as `useColorScheme`. This
 * is different from `useColorScheme`: that hook only reports the OS's
 * current preference, which is always `"light"` or `"dark"`. This hook
 * also remembers a user's own choice, and falls back to the OS
 * preference when `theme` is `"system"`. `resolvedTheme` is always
 * `"light"` or `"dark"`: the OS preference when `theme` is `"system"`,
 * otherwise it matches `theme`.
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
