import type { NetworkState } from "./_network.ts";

import { useNetworkSnapshot } from "./_network.ts";

export type { NetworkState } from "./_network.ts";

/**
 * `navigator.onLine` plus `navigator.connection` info (`effectiveType`,
 * `downlink`, `rtt`, `saveData`) in browsers that support the
 * NetworkInformation API. Those fields are `undefined` in other browsers.
 * Updates on `online`/`offline` events and on connection `change` events.
 * During server rendering, `online` defaults to `true` and the rest are
 * `undefined`.
 *
 * @example
 * ```tsx
 * const { online, effectiveType, saveData } = useNetworkState();
 * ```
 */
export const useNetworkState = (): NetworkState => useNetworkSnapshot();
