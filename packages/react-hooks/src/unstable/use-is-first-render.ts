import { useRef } from "react";

import { isProductionBuild } from "./_env.ts";

/**
 * `true` only on the mount render, `false` on every render after. No-ops
 * (always `false`) in production builds.
 *
 * @example
 * ```tsx
 * const isFirstRender = useIsFirstRender();
 * if (isFirstRender) console.log("mounted");
 * ```
 */
export const useIsFirstRender = (): boolean => {
  const isFirstRef = useRef(true);
  if (isProductionBuild()) {
    return false;
  }
  const isFirst = isFirstRef.current;
  isFirstRef.current = false;
  return isFirst;
};
