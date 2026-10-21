import { useNetworkSnapshot } from "./_network.ts";

/**
 * Tracks `navigator.onLine`. It updates when the `online` or `offline`
 * window events fire. Defaults to `true` during server rendering and
 * before the client connects, since most visitors are online. This avoids
 * showing a wrong "offline" message at first.
 *
 * @example
 * ```tsx
 * const isOnline = useOnlineStatus();
 * ```
 */
export const useOnlineStatus = (): boolean => useNetworkSnapshot().online;
