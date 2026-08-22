import { useNetworkSnapshot } from "./_network.ts";

/**
 * Tracks `navigator.onLine`, updating on the `online`/`offline` window
 * events. Defaults to `true` during server rendering and before the client
 * subscribes — most visitors are online, so this avoids a false "offline"
 * flash on the common path.
 *
 * @example
 * ```tsx
 * const isOnline = useOnlineStatus();
 * ```
 */
export const useOnlineStatus = (): boolean => useNetworkSnapshot().online;
