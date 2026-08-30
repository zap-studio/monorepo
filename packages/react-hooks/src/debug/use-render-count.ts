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
    // oxlint-disable-next-line react/refs -- see the disable comment below. This hook reads the ref during render on purpose.
    return countRef.current;
  }
  // oxlint-disable-next-line react-doctor/no-ref-current-in-render, react/refs -- this hook counts every render attempt, even the ones React throws away. An effect would count commits instead. That is not what we want here.
  countRef.current += 1;
  // oxlint-disable-next-line react/refs -- same read as above, on purpose.
  return countRef.current;
};
