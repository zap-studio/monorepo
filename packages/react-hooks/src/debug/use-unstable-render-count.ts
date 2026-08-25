import { useRef } from "react";

import { isProductionBuild } from "./_env.ts";

/**
 * The render count for the calling component instance — `1` on mount,
 * incrementing by one on every subsequent render. Always `0` in
 * production builds.
 *
 * It counts render *attempts*, not commits, which is the point of the hook
 * but means the number is not one-per-visible-update: StrictMode
 * double-invokes every render, so it reports `2`, `4`, `6`…, and a render
 * React starts and then throws away still increments it.
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
  // oxlint-disable-next-line react-doctor/no-ref-current-in-render -- this hook's entire purpose is counting actual render attempts (including ones React discards); moving this into an effect would count commits instead and defeat the hook.
  countRef.current += 1;
  return countRef.current;
};
