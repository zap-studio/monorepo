import { useSyncExternalStore } from "react";

const subscribe = () => () => {};
const getSnapshot = (): boolean => false;
const getServerSnapshot = (): boolean => true;

/**
 * `true` during server rendering, `false` once mounted on the client — the
 * inverse of `useIsClient`. Useful for skipping client-only work during SSR.
 */
export const useIsServer = (): boolean =>
  useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
