import { useRef } from "react";

import { isProductionBuild } from "./_env.ts";

/**
 * The render count for the calling component instance — `1` on mount,
 * incrementing by one on every subsequent render. No-ops (always `0`) in
 * production builds.
 *
 * @example
 * ```tsx
 * const renderCount = useRenderCount();
 * console.log(`rendered ${renderCount} times`);
 * ```
 */
export const useRenderCount = (): number => {
  const countRef = useRef(0);
  if (isProductionBuild()) {
    return countRef.current;
  }
  countRef.current += 1;
  return countRef.current;
};
