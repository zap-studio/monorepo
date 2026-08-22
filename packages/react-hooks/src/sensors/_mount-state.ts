import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/**
 * Shared mount-state primitive behind `useIsClient` and `useIsServer`. Not
 * itself a public hook — hook files never import one another, so shared
 * logic lives here (mirrors `@zap-studio/retry`'s `_otel.ts` convention).
 *
 * Returns `clientValue` once mounted on the client, `serverValue` during
 * server rendering.
 */
export const useMountState = (clientValue: boolean, serverValue: boolean): boolean =>
  useSyncExternalStore(
    subscribe,
    () => clientValue,
    () => serverValue,
  );
