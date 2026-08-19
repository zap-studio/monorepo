import { useCallback, useRef, useSyncExternalStore } from "react";

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
 * `screen.orientation`'s `angle`/`type`, updating on its `change` event and
 * the legacy `window` `orientationchange` event. Falls back to
 * `{ angle: 0 }` during server rendering, before the client subscribes, and
 * where the ScreenOrientation API is unsupported.
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
