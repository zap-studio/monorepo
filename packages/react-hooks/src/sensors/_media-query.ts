import { useCallback, useSyncExternalStore } from "react";

const getServerSnapshot = (): boolean => false;

/**
 * Shared `matchMedia` subscription used by `useMediaQuery` and `useIsMobile`.
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
