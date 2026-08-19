import { useCallback, useSyncExternalStore } from "react";

const getServerSnapshot = (): number => 1;

const getSnapshot = (): number => window.devicePixelRatio;

/**
 * `window.devicePixelRatio`, updating on zoom or a monitor-move-driven DPR
 * change. There's no native "devicePixelRatio changed" event, so this
 * subscribes to a `(resolution: <current DPR>dppx)` media query — which
 * only ever matches once — and recreates it against the new DPR each time
 * it fires. Useful for canvas/retina rendering. Falls back to `1` during
 * server rendering and before the client subscribes.
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
