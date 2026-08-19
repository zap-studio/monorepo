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
  // oxlint-disable-next-line github/prefer-observers -- ResizeObserver observes a specific element's box, not the window/viewport itself; there's no element whose border-box exactly matches innerWidth/innerHeight (scrollbars, etc.), so the `resize` event is the correct primitive here.
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
