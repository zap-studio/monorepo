import { useMountState } from "./_mount-state.ts";

/**
 * SSR-safe hydration guard — `false` during server rendering, `true` once
 * mounted on the client. Useful for gating client-only rendering (portals,
 * `window`-dependent UI) without a hydration mismatch.
 *
 * @example
 * ```tsx
 * const isClient = useIsClient();
 * return isClient ? <ClientOnlyWidget /> : null;
 * ```
 */
export const useIsClient = (): boolean => useMountState(true, false);
