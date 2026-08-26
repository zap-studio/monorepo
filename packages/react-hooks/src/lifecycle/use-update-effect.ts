import { type DependencyList, type EffectCallback, useEffect, useRef } from "react";

/**
 * Works like `useEffect`, but skips the first run on mount. It only runs
 * `effect` when a dependency actually changes (cleanup still works the
 * same way). `deps` is passed straight through, so it follows the same
 * rules as a normal `useEffect` dependency array.
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
    // oxlint-disable-next-line react-hooks/exhaustive-deps -- deps is passed straight through from the caller, just like useEffect's own dependency array. This hook has no way to know its contents ahead of time.
  }, deps);
};
