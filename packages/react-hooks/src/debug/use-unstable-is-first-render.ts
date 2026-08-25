import { useEffect, useRef } from "react";

import { isProductionBuild } from "./_env.ts";

/**
 * `true` only on the mount render, `false` on every render after. Always
 * `false` in production builds. The flag is flipped in a mount effect
 * rather than during render, so StrictMode's double-invoked mount render
 * reports `true` on both passes instead of returning `false` from the one
 * React actually commits.
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
  // oxlint-disable-next-line react-doctor/no-ref-current-in-render -- read-only, and the ref only ever holds a committed value, so both passes of a double-invoked render agree; the write it used to pair with now lives in the mount effect above.
  return !mountedRef.current;
};
