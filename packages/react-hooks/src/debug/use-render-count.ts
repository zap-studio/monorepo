import { useRef } from "react";

import { isProductionBuild } from "./_env.ts";

/**
 * The render count for this component instance. Starts at `1` on mount
 * and increases by one on every render after that. Always `0` in
 * production builds.
 *
 * This counts every render attempt, not just the ones React actually
 * shows on screen. That's the point of the hook, but it means the number
 * can be higher than you expect: React's StrictMode renders twice, so
 * you'll see `2`, `4`, `6`, and so on. A render that React starts and
 * then discards still counts.
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
  // oxlint-disable-next-line react-doctor/no-ref-current-in-render -- this hook counts every render attempt, even the ones React throws away. An effect would count commits instead, which is not what we want.
  countRef.current += 1;
  return countRef.current;
};
