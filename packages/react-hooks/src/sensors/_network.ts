import { useCallback, useRef, useSyncExternalStore } from "react";

export interface NetworkInformation extends EventTarget {
  readonly downlink?: number;
  // oxlint-disable-next-line sonarjs/max-union-size -- Models the NetworkInformation Web API's fixed effectiveType set; the 4 values are the whole spec, not something to shrink.
  readonly effectiveType?: "2g" | "3g" | "4g" | "slow-2g";
  readonly rtt?: number;
  readonly saveData?: boolean;
}

interface NavigatorWithConnection extends Navigator {
  readonly connection?: NetworkInformation;
}

/** The shape returned by `useNetworkState` (and `useOnlineStatus`'s `.online`). */
export interface NetworkState {
  downlink?: number;
  // oxlint-disable-next-line sonarjs/max-union-size -- Same fixed NetworkInformation effectiveType set as above.
  effectiveType?: "2g" | "3g" | "4g" | "slow-2g";
  online: boolean;
  rtt?: number;
  saveData?: boolean;
}

const SERVER_SNAPSHOT: NetworkState = {
  online: true,
};

const getConnection = (): NetworkInformation | undefined =>
  // SAFETY: NetworkInformation is an experimental Web API not declared in TypeScript's DOM lib; every caller reads its fields through optional chaining, so an unsupported browser (where `connection` is genuinely absent) degrades to `undefined` rather than throwing.
  (navigator as NavigatorWithConnection).connection;

const readNetworkState = (): NetworkState => {
  const connection = getConnection();
  return {
    ...(connection?.downlink !== undefined && { downlink: connection.downlink }),
    ...(connection?.effectiveType !== undefined && { effectiveType: connection.effectiveType }),
    online: navigator.onLine,
    ...(connection?.rtt !== undefined && { rtt: connection.rtt }),
    ...(connection?.saveData !== undefined && { saveData: connection.saveData }),
  };
};

const networkStatesEqual = (a: NetworkState, b: NetworkState): boolean =>
  a.online === b.online &&
  a.effectiveType === b.effectiveType &&
  a.downlink === b.downlink &&
  a.rtt === b.rtt &&
  a.saveData === b.saveData;

const getServerSnapshot = (): NetworkState => SERVER_SNAPSHOT;

const subscribe = (onStoreChange: () => void) => {
  window.addEventListener("online", onStoreChange);
  window.addEventListener("offline", onStoreChange);
  getConnection()?.addEventListener("change", onStoreChange);
  return () => {
    window.removeEventListener("online", onStoreChange);
    window.removeEventListener("offline", onStoreChange);
    getConnection()?.removeEventListener("change", onStoreChange);
  };
};

/**
 * Shared `navigator.onLine` + `navigator.connection` subscription behind
 * `useOnlineStatus` and `useNetworkState`. Not itself a public hook — hook
 * files never import one another, so shared logic lives here (mirrors
 * `@zap-studio/retry`'s `_otel.ts` convention).
 *
 * Caches the snapshot object by field equality so unchanged reads return the
 * same reference — required by `useSyncExternalStore` to avoid re-rendering
 * (or looping) on every read.
 */
export const useNetworkSnapshot = (): NetworkState => {
  const cacheRef = useRef<NetworkState>(SERVER_SNAPSHOT);

  const getSnapshot = useCallback((): NetworkState => {
    const next = readNetworkState();
    if (!networkStatesEqual(cacheRef.current, next)) {
      cacheRef.current = next;
    }
    return cacheRef.current;
  }, []);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
};
