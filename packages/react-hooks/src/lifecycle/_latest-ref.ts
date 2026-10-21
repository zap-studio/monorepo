import { useEffect, useRef } from "react";

/**
 * Keeps a ref pointed at the latest `value` without resetting on every
 * render. Backs hooks like `useInterval`/`useTimeout` that need to call
 * the newest callback without re-running the effect that scheduled it.
 */
export const useLatestRef = <T>(value: T): { readonly current: T } => {
  const ref = useRef(value);
  useEffect(() => {
    ref.current = value;
  });
  return ref;
};
