import { useCallback, useRef, useSyncExternalStore } from "react";

/** The shape returned by `useOrientation`. */
export interface Orientation {
  angle: number;
  type?: OrientationType;
}

const FALLBACK_ORIENTATION: Orientation = { angle: 0 };

const readOrientation = (): Orientation => {
  const info = screen.orientation;
  return info ? { angle: info.angle, type: info.type } : FALLBACK_ORIENTATION;
};

const orientationsEqual = (a: Orientation, b: Orientation): boolean =>
  a.angle === b.angle && a.type === b.type;

const getServerSnapshot = (): Orientation => FALLBACK_ORIENTATION;

const subscribe = (onStoreChange: () => void) => {
  screen.orientation?.addEventListener("change", onStoreChange);
  window.addEventListener("orientationchange", onStoreChange);
  return () => {
    screen.orientation?.removeEventListener("change", onStoreChange);
    window.removeEventListener("orientationchange", onStoreChange);
  };
};

/**
 * Gives you `screen.orientation`'s `angle` and `type`. It updates when the
 * `change` event fires, or the older `orientationchange` window event.
 * Falls back to `{ angle: 0 }` during server rendering, before the client
 * connects, and in browsers that don't support the ScreenOrientation API.
 *
 * @example
 * ```tsx
 * const { angle, type } = useOrientation();
 * ```
 */
export const useOrientation = (): Orientation => {
  const cacheRef = useRef<Orientation>(FALLBACK_ORIENTATION);

  const getSnapshot = useCallback((): Orientation => {
    const next = readOrientation();
    if (!orientationsEqual(cacheRef.current, next)) {
      cacheRef.current = next;
    }
    return cacheRef.current;
  }, []);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
};
