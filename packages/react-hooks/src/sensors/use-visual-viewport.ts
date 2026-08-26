import { useCallback, useRef, useSyncExternalStore } from "react";

/** The shape returned by `useVisualViewport`. */
export interface VisualViewportState {
  height: number;
  offsetLeft: number;
  offsetTop: number;
  pageLeft: number;
  pageTop: number;
  scale: number;
  width: number;
}

const FALLBACK_VIEWPORT: VisualViewportState = {
  height: 0,
  offsetLeft: 0,
  offsetTop: 0,
  pageLeft: 0,
  pageTop: 0,
  scale: 1,
  width: 0,
};

const readViewport = (): VisualViewportState => {
  const viewport = window.visualViewport;
  return viewport
    ? {
        height: viewport.height,
        offsetLeft: viewport.offsetLeft,
        offsetTop: viewport.offsetTop,
        pageLeft: viewport.pageLeft,
        pageTop: viewport.pageTop,
        scale: viewport.scale,
        width: viewport.width,
      }
    : FALLBACK_VIEWPORT;
};

const viewportsEqual = (a: VisualViewportState, b: VisualViewportState): boolean =>
  a.width === b.width &&
  a.height === b.height &&
  a.offsetLeft === b.offsetLeft &&
  a.offsetTop === b.offsetTop &&
  a.pageLeft === b.pageLeft &&
  a.pageTop === b.pageTop &&
  a.scale === b.scale;

const getServerSnapshot = (): VisualViewportState => FALLBACK_VIEWPORT;

const subscribe = (onStoreChange: () => void) => {
  // oxlint-disable-next-line github/prefer-observers -- VisualViewport is its own event target. It isn't an element, so ResizeObserver or IntersectionObserver can't attach to it. Its resize/scroll events are the only way to detect changes.
  window.visualViewport?.addEventListener("resize", onStoreChange);
  // oxlint-disable-next-line github/prefer-observers -- Same VisualViewport target as above. There's no element to observe.
  window.visualViewport?.addEventListener("scroll", onStoreChange);
  return () => {
    window.visualViewport?.removeEventListener("resize", onStoreChange);
    window.visualViewport?.removeEventListener("scroll", onStoreChange);
  };
};

/**
 * Gives you `window.visualViewport`'s size and position. It updates on
 * `resize` and `scroll` events. This is the viewport that actually
 * shrinks when an on-screen mobile keyboard opens — unlike
 * `useWindowSize`'s `innerHeight`, which doesn't change. Falls back to
 * `{ width: 0, height: 0, offsetLeft: 0, offsetTop: 0, pageLeft: 0,
 * pageTop: 0, scale: 1 }` during server rendering, before the client
 * connects, and when the Visual Viewport API isn't supported.
 *
 * @example
 * ```tsx
 * const { height, scale } = useVisualViewport();
 * ```
 */
export const useVisualViewport = (): VisualViewportState => {
  const cacheRef = useRef<VisualViewportState>(FALLBACK_VIEWPORT);

  const getSnapshot = useCallback((): VisualViewportState => {
    const next = readViewport();
    if (!viewportsEqual(cacheRef.current, next)) {
      cacheRef.current = next;
    }
    return cacheRef.current;
  }, []);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
};
