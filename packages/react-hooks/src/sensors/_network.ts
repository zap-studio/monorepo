import { useCallback, useRef, useSyncExternalStore } from "react";

/** A small copy of the Network Information API's types, not declared elsewhere. */
export interface NetworkInformation extends EventTarget {
  readonly downlink?: number;
  // oxlint-disable-next-line sonarjs/max-union-size -- these are the only 4 values that the NetworkInformation spec allows for effectiveType. We cannot make the list shorter.
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
  // oxlint-disable-next-line sonarjs/max-union-size -- same fixed effectiveType values as above.
  effectiveType?: "2g" | "3g" | "4g" | "slow-2g";
  online: boolean;
  rtt?: number;
  saveData?: boolean;
}

const SERVER_SNAPSHOT: NetworkState = {
  online: true,
};

const getConnection = (): NetworkInformation | undefined =>
  // SAFETY: connection isn't declared on Navigator. Every caller reads its fields with optional chaining, so a browser without `connection` reads as `undefined` instead of throwing.
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
 * Shared `navigator.onLine` and `navigator.connection` subscription used by
 * `useOnlineStatus` and `useNetworkState`.
 *
 * Caches the snapshot object and only replaces it when a field actually
 * changes, so unchanged reads return the same object reference.
 * `useSyncExternalStore` needs this to avoid re-rendering (or looping
 * forever) on every read.
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
