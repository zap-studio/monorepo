import { useMediaQueryMatch } from "./_media-query.ts";

const DEFAULT_BREAKPOINT_PX = 768;

/**
 * Reports whether the viewport is below a breakpoint (768px by default) —
 * `(max-width: breakpoint - 1)`. SSR-safe — returns `false` until the client
 * subscribes via `matchMedia`.
 */
export const useIsMobile = (breakpointPx: number = DEFAULT_BREAKPOINT_PX): boolean =>
  useMediaQueryMatch(`(max-width: ${breakpointPx - 1}px)`);
