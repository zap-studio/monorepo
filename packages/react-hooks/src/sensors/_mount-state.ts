import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/**
 * Shared mount-state logic used by `useIsClient` and `useIsServer`.
 *
 * Returns `clientValue` once mounted on the client, or `serverValue` during
 * server rendering.
 */
const useMountState = (clientValue: boolean, serverValue: boolean): boolean =>
  useSyncExternalStore(
    subscribe,
    () => clientValue,
    () => serverValue,
  );

export { useMountState };
