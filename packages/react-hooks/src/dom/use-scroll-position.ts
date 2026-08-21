import { useCallback, useRef, useSyncExternalStore } from "react";

/** The shape returned by `useScrollPosition`. */
export interface ScrollPosition {
  x: number;
  y: number;
}

const FALLBACK_POSITION: ScrollPosition = { x: 0, y: 0 };

const positionsEqual = (a: ScrollPosition, b: ScrollPosition): boolean =>
  a.x === b.x && a.y === b.y;

const getServerSnapshot = (): ScrollPosition => FALLBACK_POSITION;

const subscribe = (onStoreChange: () => void) => {
  // oxlint-disable-next-line github/prefer-observers -- IntersectionObserver reports a specific element's visibility, not the window's own scroll offset; there's no element/root pairing that yields scrollX/scrollY, so the `scroll` event is the correct primitive here.
  window.addEventListener("scroll", onStoreChange);
  return () => window.removeEventListener("scroll", onStoreChange);
};

/**
 * `window.scrollX`/`scrollY`, updating on the `scroll` event —
 * window-level; for a specific scrollable element, attach a listener to
 * its ref instead (see `useEventListener`). Falls back to `{ x: 0, y: 0 }`
 * during server rendering and before the client subscribes.
 *
 * @example
 * ```tsx
 * const { y } = useScrollPosition();
 * const showBackToTop = y > 400;
 * ```
 */
export const useScrollPosition = (): ScrollPosition => {
  const cacheRef = useRef<ScrollPosition>(FALLBACK_POSITION);

  const getSnapshot = useCallback((): ScrollPosition => {
    const next: ScrollPosition = { x: window.scrollX, y: window.scrollY };
    if (!positionsEqual(cacheRef.current, next)) {
      cacheRef.current = next;
    }
    return cacheRef.current;
  }, []);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
};
