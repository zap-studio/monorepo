import { useRef } from "react";

import { isProductionBuild } from "./_env.ts";

/**
 * The render count for the calling component instance — `1` on mount,
 * incrementing by one on every subsequent render. Always `0` in
 * production builds.
 *
 * @example
 * ```tsx
 * const renderCount = useUnstableRenderCount();
 * console.log(`rendered ${renderCount} times`);
 * ```
 */
export const useUnstableRenderCount = (): number => {
  const countRef = useRef(0);
  if (isProductionBuild()) {
    return countRef.current;
  }
  countRef.current += 1;
  return countRef.current;
};
