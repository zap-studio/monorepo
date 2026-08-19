import { useSyncExternalStore } from "react";

const getSnapshot = (): boolean => navigator.onLine;
const getServerSnapshot = (): boolean => true;

const subscribe = (onStoreChange: () => void) => {
  window.addEventListener("online", onStoreChange);
  window.addEventListener("offline", onStoreChange);
  return () => {
    window.removeEventListener("online", onStoreChange);
    window.removeEventListener("offline", onStoreChange);
  };
};

/**
 * Tracks `navigator.onLine`, updating on the `online`/`offline` window
 * events. Defaults to `true` during server rendering and before the client
 * subscribes — most visitors are online, so this avoids a false "offline"
 * flash on the common path.
 */
export const useOnlineStatus = (): boolean =>
  useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
