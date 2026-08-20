import { useEffect } from "react";

/**
 * Runs `effect` exactly once, on mount — a thin `useEffect(effect, [])`
 * wrapper for callers who want the intent to read explicitly rather than
 * relying on an empty dependency array. `effect` is only ever called with
 * the reference passed on the first render; later renders' closures are
 * never invoked (mirrors `useEffect(fn, [])`'s own semantics).
 *
 * @example
 * ```tsx
 * useMount(() => analytics.track("page_viewed"));
 * ```
 */
export const useMount = (effect: () => void): void => {
  useEffect(() => {
    effect();
    // oxlint-disable-next-line react-hooks/exhaustive-deps -- runs exactly once on mount by design, matching useEffect(fn, []); re-running when `effect`'s reference changes would defeat the hook's entire purpose.
  }, []);
};
