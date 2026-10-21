import { useCallback, useRef, useSyncExternalStore } from "react";

/** The shape returned by `useWindowSize`. */
export interface WindowSize {
  height: number;
  width: number;
}

const FALLBACK_SIZE: WindowSize = { height: 0, width: 0 };

const sizesEqual = (a: WindowSize, b: WindowSize): boolean =>
  a.width === b.width && a.height === b.height;

const getServerSnapshot = (): WindowSize => FALLBACK_SIZE;

const subscribe = (onStoreChange: () => void) => {
  // oxlint-disable-next-line github/prefer-observers -- ResizeObserver watches one element, not the window. No element has the same size as innerWidth/innerHeight, because of scrollbars and so on. So we need the `resize` event.
  window.addEventListener("resize", onStoreChange);
  return () => window.removeEventListener("resize", onStoreChange);
};

/**
 * `window.innerWidth`/`innerHeight`, updating on the `resize` event. Falls
 * back to `{ width: 0, height: 0 }` during server rendering and before the
 * client subscribes.
 *
 * @example
 * ```tsx
 * const { width, height } = useWindowSize();
 * ```
 */
export const useWindowSize = (): WindowSize => {
  const cacheRef = useRef<WindowSize>(FALLBACK_SIZE);

  const getSnapshot = useCallback((): WindowSize => {
    const next: WindowSize = { height: window.innerHeight, width: window.innerWidth };
    if (!sizesEqual(cacheRef.current, next)) {
      cacheRef.current = next;
    }
    return cacheRef.current;
  }, []);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
};
