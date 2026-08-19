import { useCallback, useRef, useSyncExternalStore } from "react";

export interface VirtualKeyboard extends EventTarget {
  readonly boundingRect: { height: number; width: number; x: number; y: number };
}

interface NavigatorWithVirtualKeyboard extends Navigator {
  readonly virtualKeyboard?: VirtualKeyboard;
}

export interface VirtualKeyboardRect {
  height: number;
  width: number;
  x: number;
  y: number;
}

const FALLBACK_RECT: VirtualKeyboardRect = { height: 0, width: 0, x: 0, y: 0 };

const getVirtualKeyboard = (): VirtualKeyboard | undefined =>
  // SAFETY: VirtualKeyboard is an experimental, Chromium-only API not declared in TypeScript's DOM lib; every caller reads it through optional chaining, so an unsupported browser degrades to the fallback rect rather than throwing.
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
 * `navigator.virtualKeyboard`'s `boundingRect` (Chromium-only VirtualKeyboard
 * API), updating on its `geometrychange` event. Falls back to
 * `{ x: 0, y: 0, width: 0, height: 0 }` during server rendering, before the
 * client subscribes, and where the API is unsupported.
 *
 * @example
 * ```tsx
 * const { height } = useVirtualKeyboard(); // on-screen keyboard height, in px
 * ```
 */
export const useVirtualKeyboard = (): VirtualKeyboardRect => {
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
