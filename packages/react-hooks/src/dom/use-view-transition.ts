import { useCallback } from "react";

/** The shape returned by `useViewTransition`. */
export interface UseViewTransitionResult {
  startTransition: (callback: () => Promise<void> | void) => Promise<void>;
  supported: boolean;
}

const isSupported = (): boolean =>
  typeof document !== "undefined" && typeof document.startViewTransition === "function";

/**
 * Wraps `document.startViewTransition()` — runs `callback` (typically a DOM
 * update) inside a native view transition, animating between the before/
 * after states. Where unsupported, `startTransition` just calls `callback`
 * directly and resolves once it settles — the recommended fallback, per
 * the spec, since the DOM update itself still needs to happen.
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

  return { startTransition, supported };
};
