import { useCallback, useRef, useSyncExternalStore } from "react";

interface NavigatorWithDeviceMemory extends Navigator {
  readonly deviceMemory?: number;
}

/** The shape returned by `useDeviceCapabilities`. */
export interface DeviceCapabilities {
  deviceMemory?: number;
  hardwareConcurrency: number;
}

const SERVER_SNAPSHOT: DeviceCapabilities = { hardwareConcurrency: 0 };

const getServerSnapshot = () => SERVER_SNAPSHOT;

const capabilitiesEqual = (a: DeviceCapabilities, b: DeviceCapabilities): boolean =>
  a.hardwareConcurrency === b.hardwareConcurrency && a.deviceMemory === b.deviceMemory;

const subscribe = () => () => {};

/**
 * `navigator.hardwareConcurrency` and `navigator.deviceMemory`. Only
 * Chromium browsers support `deviceMemory`; it is `undefined` elsewhere.
 * These values don't change while the app runs. During server rendering,
 * this returns `{ hardwareConcurrency: 0, deviceMemory: undefined }` (the
 * safe default).
 *
 * @example
 * ```tsx
 * const { hardwareConcurrency, deviceMemory } = useDeviceCapabilities();
 * ```
 */
export const useDeviceCapabilities = (): DeviceCapabilities => {
  const cacheRef = useRef<DeviceCapabilities>(SERVER_SNAPSHOT);

  const getSnapshot = useCallback((): DeviceCapabilities => {
    // SAFETY: deviceMemory is not declared on Navigator. We read it as optional, so a browser without support gives `undefined` instead of crashing.
    const deviceMemory = (navigator as NavigatorWithDeviceMemory).deviceMemory;
    const next: DeviceCapabilities = {
      ...(deviceMemory !== undefined && { deviceMemory }),
      hardwareConcurrency: navigator.hardwareConcurrency,
    };
    if (!capabilitiesEqual(cacheRef.current, next)) {
      cacheRef.current = next;
    }
    return cacheRef.current;
  }, []);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
};
