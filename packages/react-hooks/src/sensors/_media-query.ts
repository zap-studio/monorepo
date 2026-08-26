import { useCallback, useSyncExternalStore } from "react";

const getServerSnapshot = (): boolean => false;

/**
 * Shared `matchMedia` subscription used by `useMediaQuery` and `useIsMobile`.
 * It is not a public hook itself. Hook files never import each other, so
 * shared code lives here instead (the same pattern as `_otel.ts` in
 * `@zap-studio/retry`).
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
