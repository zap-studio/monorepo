import { useCallback, useMemo } from "react";

/** The shape returned by `useViewTransition`. */
export interface UseViewTransitionResult {
  startTransition: (callback: () => Promise<void> | void) => Promise<void>;
  supported: boolean;
}

const isSupported = (): boolean =>
  typeof document !== "undefined" && typeof document.startViewTransition === "function";

/**
 * Wraps the browser's `document.startViewTransition()` API. It runs
 * `callback` (usually a DOM update) inside a native view transition,
 * which animates between the before and after states.
 *
 * If the browser doesn't support view transitions, `startTransition` just
 * calls `callback` directly and waits for it to finish. This is the
 * fallback recommended by the spec, since the DOM update still needs to
 * happen either way.
 *
 * @example
 * ```tsx
 * const { startTransition } = useViewTransition();
 * const handleThemeChange = () => startTransition(() => setTheme("dark"));
 * ```
 */
export const useViewTransition = (): UseViewTransitionResult => {
  const supported = isSupported();

  const startTransition = useCallback(
    async (callback: () => Promise<void> | void): Promise<void> => {
      if (!isSupported()) {
        await callback();
        return;
      }
      await document.startViewTransition(async () => {
        await callback();
      }).finished;
    },
    [],
  );

  return useMemo(() => ({ startTransition, supported }), [startTransition, supported]);
};
