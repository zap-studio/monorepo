import { useCallback, useSyncExternalStore } from "react";

const getServerSnapshot = (): number => 1;

const getSnapshot = (): number => window.devicePixelRatio;

/**
 * `window.devicePixelRatio`. Updates when the user zooms, or when the
 * window moves to a screen with a different pixel ratio. There is no
 * built-in event for this change, so the hook subscribes to a
 * `(resolution: <current ratio>dppx)` media query. That query only ever
 * matches once, so the hook creates a new one with the updated ratio each
 * time it fires. Useful for canvas or retina-display rendering. Falls back
 * to `1` during server rendering and before the client subscribes.
 *
 * @example
 * ```tsx
 * const dpr = useDevicePixelRatio();
 * ```
 */
export const useDevicePixelRatio = (): number => {
  const subscribe = useCallback((onStoreChange: () => void) => {
    let mediaQueryList = window.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`);

    const handleChange = () => {
      mediaQueryList.removeEventListener("change", handleChange);
      mediaQueryList = window.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`);
      mediaQueryList.addEventListener("change", handleChange);
      onStoreChange();
    };

    mediaQueryList.addEventListener("change", handleChange);
    return () => mediaQueryList.removeEventListener("change", handleChange);
  }, []);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
};
