import { useCallback, useRef, useSyncExternalStore } from "react";

/** The shape returned by `usePreferredLanguage`. */
export interface PreferredLanguage {
  language: string;
  languages: readonly string[];
}

const FALLBACK_LANGUAGE: PreferredLanguage = { language: "en", languages: ["en"] };

const languagesEqual = (a: readonly string[], b: readonly string[]): boolean =>
  a.length === b.length && a.every((value, index) => value === b[index]);

const getServerSnapshot = (): PreferredLanguage => FALLBACK_LANGUAGE;

const subscribe = (onStoreChange: () => void) => {
  window.addEventListener("languagechange", onStoreChange);
  return () => window.removeEventListener("languagechange", onStoreChange);
};

/**
 * `navigator.language` and `navigator.languages`, updating on the
 * `languagechange` event. Falls back to `"en"` during server rendering and
 * before the client subscribes.
 *
 * @example
 * ```tsx
 * const { language } = usePreferredLanguage(); // e.g. "en-US"
 * ```
 */
export const usePreferredLanguage = (): PreferredLanguage => {
  const cacheRef = useRef<PreferredLanguage>(FALLBACK_LANGUAGE);

  const getSnapshot = useCallback((): PreferredLanguage => {
    const next: PreferredLanguage = {
      language: navigator.language,
      languages: navigator.languages,
    };
    if (
      cacheRef.current.language !== next.language ||
      !languagesEqual(cacheRef.current.languages, next.languages)
    ) {
      cacheRef.current = next;
    }
    return cacheRef.current;
  }, []);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
};
