import { useCallback, useSyncExternalStore } from "react";

const getServerSnapshot = (): boolean => false;

/**
 * Shared `matchMedia` subscription behind `useMediaQuery` and `useIsMobile`.
 * Not itself a public hook — hook files never import one another, so shared
 * logic lives here (mirrors `@zap-studio/retry`'s `_otel.ts` convention).
 */
export const useMediaQueryMatch = (query: string): boolean => {
  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      const mediaQueryList = window.matchMedia(query);
      mediaQueryList.addEventListener("change", onStoreChange);
      return () => mediaQueryList.removeEventListener("change", onStoreChange);
    },
    [query],
  );

  const getSnapshot = useCallback(() => window.matchMedia(query).matches, [query]);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
};
