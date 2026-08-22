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

const capabilitiesEqual = (a: DeviceCapabilities, b: DeviceCapabilities): boolean =>
  a.hardwareConcurrency === b.hardwareConcurrency && a.deviceMemory === b.deviceMemory;

const subscribe = () => () => {};

/**
 * `navigator.hardwareConcurrency` and `navigator.deviceMemory` (the latter
 * Chromium-only — `undefined` elsewhere). Static device capabilities —
 * don't change at runtime. `{ hardwareConcurrency: 0, deviceMemory:
 * undefined }` — the SSR-safe default — during server rendering.
 *
 * @example
 * ```tsx
 * const { hardwareConcurrency, deviceMemory } = useDeviceCapabilities();
 * ```
 */
export const useDeviceCapabilities = (): DeviceCapabilities => {
  const cacheRef = useRef<DeviceCapabilities>(SERVER_SNAPSHOT);

  const getSnapshot = useCallback((): DeviceCapabilities => {
    // SAFETY: deviceMemory is a Chromium-only Device Memory API field not declared in TypeScript's DOM lib; read as optional, so an unsupported browser yields undefined rather than throwing.
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

  return useSyncExternalStore(subscribe, getSnapshot, () => SERVER_SNAPSHOT);
};
