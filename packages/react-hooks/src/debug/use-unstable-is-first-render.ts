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
 * const isFirstRender = useUnstableIsFirstRender();
 * if (isFirstRender) console.log("mounted");
 * ```
 */
export const useUnstableIsFirstRender = (): boolean => {
  const mountedRef = useRef(false);
  useEffect(() => {
    mountedRef.current = true;
  }, []);

  if (isProductionBuild()) {
    return false;
  }
  // oxlint-disable-next-line react-doctor/no-ref-current-in-render -- this only reads the ref, and it always holds a committed value, so both renders in StrictMode's double-invoke agree. The write happens in the mount effect above.
  return !mountedRef.current;
};
