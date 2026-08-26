import { captureOwnerStack, useCallback } from "react";

import { isProductionBuild } from "./_env.ts";

/** The shape returned by `useOwnerStack`. */
export interface UseOwnerStackResult {
  captureOwnerStack: () => string | undefined;
  supported: boolean;
}

/**
 * Wraps React 19's `captureOwnerStack` debug API. Call the returned
 * `captureOwnerStack()` function inside an event handler or effect to get
 * the JSX "owner" stack — which component rendered which. This is the
 * same trace React's own dev warnings use.
 *
 * `supported` is `false` when this API doesn't exist: on React below
 * version 19, or in a production build (where React's own
 * `captureOwnerStack` already returns `null`, which this hook turns into
 * `undefined`).
 *
 * @example
 * ```tsx
 * const { captureOwnerStack: capture, supported } = useOwnerStack();
 * const handleError = () => console.error(supported ? capture() : "unavailable");
 * ```
 */
export const useOwnerStack = (): UseOwnerStackResult => {
  const supported = !isProductionBuild() && typeof captureOwnerStack === "function";

  const capture = useCallback((): string | undefined => {
    // v8 ignore next -- the `?.` here only matters on React below version 19, where this import doesn't exist. This package requires React 19, so we can't actually test that case.
    return captureOwnerStack?.() ?? undefined;
  }, []);

  return { captureOwnerStack: capture, supported };
};
