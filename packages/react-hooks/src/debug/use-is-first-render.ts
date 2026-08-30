import { useEffect, useRef } from "react";

import { isProductionBuild } from "./_env.ts";

/**
 * Returns `true` only during the first render (mount), and `false` on
 * every render after that. Always `false` in production builds.
 *
 * The flag flips inside an effect that runs after mount, not during
 * render. This way, React's StrictMode (which renders mount twice) still
 * reports `true` both times, instead of `false` on the render React
 * actually commits.
 *
 * @example
 * ```tsx
 * const isFirstRender = useIsFirstRender();
 * if (isFirstRender) console.log("mounted");
 * ```
 */
export const useIsFirstRender = (): boolean => {
  const mountedRef = useRef(false);
  useEffect(() => {
    mountedRef.current = true;
  }, []);

  if (isProductionBuild()) {
    return false;
  }
  // oxlint-disable-next-line react/refs -- we read the ref during render on purpose. It tells us if the mount effect has run yet. There is no other way to know this.
  return !mountedRef.current;
};
