import { useCallback, useRef, useSyncExternalStore } from "react";

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
  // oxlint-disable-next-line github/prefer-observers -- VisualViewport is its own EventTarget, not an element ResizeObserver/IntersectionObserver could attach to; its own resize/scroll events are the only primitive.
  window.visualViewport?.addEventListener("resize", onStoreChange);
  // oxlint-disable-next-line github/prefer-observers -- Same VisualViewport EventTarget as above — there's no element to observe.
  window.visualViewport?.addEventListener("scroll", onStoreChange);
  return () => {
    window.visualViewport?.removeEventListener("resize", onStoreChange);
    window.visualViewport?.removeEventListener("scroll", onStoreChange);
  };
};

/**
 * `window.visualViewport`'s geometry, updating on its `resize`/`scroll`
 * events — this is what actually shrinks when an on-screen mobile keyboard
 * opens, unlike `useWindowSize`'s `innerHeight`. Falls back to
 * `{ width: 0, height: 0, offsetLeft: 0, offsetTop: 0, pageLeft: 0,
 * pageTop: 0, scale: 1 }` during server rendering, before the client
 * subscribes, and where the Visual Viewport API is unsupported.
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
