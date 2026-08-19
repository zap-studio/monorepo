import { useSyncExternalStore } from "react";

const subscribe = () => () => {};
const getSnapshot = (): boolean => true;
const getServerSnapshot = (): boolean => false;

/**
 * SSR-safe hydration guard — `false` during server rendering, `true` once
 * mounted on the client. Useful for gating client-only rendering (portals,
 * `window`-dependent UI) without a hydration mismatch.
 */
export const useIsClient = (): boolean =>
  useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
