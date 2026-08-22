import { type DependencyList, type EffectCallback, useEffect, useRef } from "react";

/**
 * `useEffect` that skips the first (mount) run — only fires on
 * dependency-driven updates, exactly like `useEffect` otherwise (cleanup
 * included). `deps` is forwarded verbatim, so it follows the exact same
 * rules as a raw `useEffect`'s dependency array.
 *
 * @example
 * ```tsx
 * useUpdateEffect(() => {
 *   toast(`Filter changed to ${filter}`); // never fires for the initial value
 * }, [filter]);
 * ```
 */
export const useUpdateEffect = (effect: EffectCallback, deps?: DependencyList): void => {
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return undefined;
    }
    return effect();
    // oxlint-disable-next-line react-hooks/exhaustive-deps -- deps is forwarded verbatim from the caller, mirroring useEffect's own contract; this hook can't statically know its shape.
  }, deps);
};
