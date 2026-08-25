import { useRef } from "react";

import { isProductionBuild } from "./_env.ts";

/**
 * `true` only on the mount render, `false` on every render after. Always
 * `false` in production builds.
 *
 * @example
 * ```tsx
 * const isFirstRender = useUnstableIsFirstRender();
 * if (isFirstRender) console.log("mounted");
 * ```
 */
export const useUnstableIsFirstRender = (): boolean => {
  const isFirstRef = useRef(true);
  if (isProductionBuild()) {
    return false;
  }
  const isFirst = isFirstRef.current;
  // oxlint-disable-next-line react-doctor/no-ref-current-in-render -- this hook's entire purpose is observing actual render attempts (including ones React discards); moving this into an effect would count commits instead and defeat the hook.
  isFirstRef.current = false;
  return isFirst;
};
