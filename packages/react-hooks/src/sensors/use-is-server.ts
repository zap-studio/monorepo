import { useMountState } from "./_mount-state.ts";

/**
 * `true` during server rendering, `false` once mounted on the client — the
 * inverse of `useIsClient`. Useful for skipping client-only work during SSR.
 */
export const useIsServer = (): boolean => useMountState(false, true);
