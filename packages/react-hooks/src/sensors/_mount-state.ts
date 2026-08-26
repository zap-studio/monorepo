import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/**
 * Shared mount-state logic used by `useIsClient` and `useIsServer`. It is
 * not a public hook itself. Hook files never import each other, so shared
 * code lives here instead (the same pattern as `_otel.ts` in
 * `@zap-studio/retry`).
 *
 * Returns `clientValue` once mounted on the client, or `serverValue` during
 * server rendering.
 */
export const useMountState = (clientValue: boolean, serverValue: boolean): boolean =>
  useSyncExternalStore(
    subscribe,
    () => clientValue,
    () => serverValue,
  );
