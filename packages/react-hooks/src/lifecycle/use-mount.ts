import { useEffect, useRef } from "react";

/**
 * Runs `effect` exactly once, when the component mounts. It's a thin
 * wrapper around `useEffect(effect, [])`, so the intent is clear without
 * needing to read an empty dependency array. Only the `effect` function
 * from the first render is ever called, even if you pass a new function
 * on later renders.
 *
 * @example
 * ```tsx
 * useMount(() => analytics.track("page_viewed"));
 * ```
 */
export const useMount = (effect: () => void): void => {
  const effectRef = useRef(effect);

  useEffect(() => {
    effectRef.current();
  }, []);
};
