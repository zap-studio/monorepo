import { useCallback, useRef, useSyncExternalStore } from "react";

/** Minimal shape of the (experimental, Chromium-only) VirtualKeyboard API, as used by `useExperimentalVirtualKeyboard`. */
export interface VirtualKeyboard extends EventTarget {
  readonly boundingRect: { height: number; width: number; x: number; y: number };
}

interface NavigatorWithVirtualKeyboard extends Navigator {
  readonly virtualKeyboard?: VirtualKeyboard;
}

/** The shape returned by `useExperimentalVirtualKeyboard`. */
export interface VirtualKeyboardRect {
  height: number;
  width: number;
  x: number;
  y: number;
}

const FALLBACK_RECT: VirtualKeyboardRect = { height: 0, width: 0, x: 0, y: 0 };

const getVirtualKeyboard = (): VirtualKeyboard | undefined =>
  // SAFETY: VirtualKeyboard is an experimental, Chromium-only API that TypeScript's DOM types don't include. Every caller uses optional chaining to read it, so unsupported browsers get the fallback rect instead of an error.
  (navigator as NavigatorWithVirtualKeyboard).virtualKeyboard;

const readRect = (): VirtualKeyboardRect => {
  const keyboard = getVirtualKeyboard();
  return keyboard ? { ...keyboard.boundingRect } : FALLBACK_RECT;
};

const rectsEqual = (a: VirtualKeyboardRect, b: VirtualKeyboardRect): boolean =>
  a.width === b.width && a.height === b.height && a.x === b.x && a.y === b.y;

const getServerSnapshot = (): VirtualKeyboardRect => FALLBACK_RECT;

const subscribe = (onStoreChange: () => void) => {
  getVirtualKeyboard()?.addEventListener("geometrychange", onStoreChange);
  return () => getVirtualKeyboard()?.removeEventListener("geometrychange", onStoreChange);
};

/**
 * Gives you `navigator.virtualKeyboard`'s `boundingRect`. The
 * VirtualKeyboard API is experimental (see MDN), Chromium-only, and it
 * updates on the `geometrychange` event. Falls back to `{ x: 0, y: 0,
 * width: 0, height: 0 }` during server rendering, before the client
 * connects, and when the API isn't supported.
 *
 * @example
 * ```tsx
 * const { height } = useExperimentalVirtualKeyboard(); // on-screen keyboard height, in px
 * ```
 */
export const useExperimentalVirtualKeyboard = (): VirtualKeyboardRect => {
  const cacheRef = useRef<VirtualKeyboardRect>(FALLBACK_RECT);

  const getSnapshot = useCallback((): VirtualKeyboardRect => {
    const next = readRect();
    if (!rectsEqual(cacheRef.current, next)) {
      cacheRef.current = next;
    }
    return cacheRef.current;
  }, []);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
};
