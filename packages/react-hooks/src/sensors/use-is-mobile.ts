import { useMediaQueryMatch } from "./_media-query.ts";

const DEFAULT_BREAKPOINT_PX = 768;

/**
 * Reports whether the viewport is below a breakpoint (768px by default) —
 * `(max-width: breakpoint - 1)`. SSR-safe — returns `false` until the client
 * subscribes via `matchMedia`.
 *
 * @example
 * ```tsx
 * const isMobile = useIsMobile(); // true below 768px
 * const isCompact = useIsMobile(1024); // true below 1024px
 * ```
 */
export const useIsMobile = (breakpointPx: number = DEFAULT_BREAKPOINT_PX): boolean =>
  useMediaQueryMatch(`(max-width: ${breakpointPx - 1}px)`);
