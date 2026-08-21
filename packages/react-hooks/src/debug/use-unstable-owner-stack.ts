import { captureOwnerStack, useCallback } from "react";

import { isProductionBuild } from "./_env.ts";

/** The shape returned by `useUnstableOwnerStack`. */
export interface UseUnstableOwnerStackResult {
  captureOwnerStack: () => string | undefined;
  supported: boolean;
}

/**
 * Wraps React 19's `captureOwnerStack` debug API — call `captureOwnerStack()`
 * during an event handler or effect to get the JSX "owner" stack (which
 * component rendered which), the same trace React's own dev warnings use.
 * `supported: false` where the export doesn't exist (React < 19, or a
 * production build — React's own `captureOwnerStack` already returns
 * `null` there, which this wrapper surfaces as `undefined`).
 *
 * @example
 * ```tsx
 * const { captureOwnerStack: capture, supported } = useUnstableOwnerStack();
 * const handleError = () => console.error(supported ? capture() : "unavailable");
 * ```
 */
export const useUnstableOwnerStack = (): UseUnstableOwnerStackResult => {
  const supported = !isProductionBuild() && typeof captureOwnerStack === "function";

  const capture = useCallback((): string | undefined => {
    // v8 ignore next -- the `?.` optional call only short-circuits on React < 19, where this named import doesn't exist; the package's own peer range (React 19) always has it, so that side is untestable here.
    return captureOwnerStack?.() ?? undefined;
  }, []);

  return { captureOwnerStack: capture, supported };
};
