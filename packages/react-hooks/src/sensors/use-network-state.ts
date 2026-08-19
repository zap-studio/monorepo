import type { NetworkState } from "./_network.ts";

import { useNetworkSnapshot } from "./_network.ts";

export type { NetworkState } from "./_network.ts";

/**
 * `navigator.onLine` plus `navigator.connection` info (`effectiveType`,
 * `downlink`, `rtt`, `saveData`) where the NetworkInformation API is
 * supported — `undefined` for those fields elsewhere. Updates on
 * `online`/`offline` and connection `change` events. During server
 * rendering, `online` defaults to `true` and the rest are `undefined`.
 */
export const useNetworkState = (): NetworkState => useNetworkSnapshot();
