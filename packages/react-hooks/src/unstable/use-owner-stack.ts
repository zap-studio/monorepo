import { captureOwnerStack, useCallback } from "react";

import { isProductionBuild } from "./_env.ts";

/** The shape returned by `useOwnerStack`. */
export interface UseOwnerStackResult {
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
 * Comparatively stable as `unstable/` hooks go — it's React's own public
 * (if dev-only) API, not private Fiber internals — but ships here for
 * consistency with the rest of this debug/observability group.
 *
 * @example
 * ```tsx
 * const { captureOwnerStack: capture, supported } = useOwnerStack();
 * const handleError = () => console.error(supported ? capture() : "unavailable");
 * ```
 */
export const useOwnerStack = (): UseOwnerStackResult => {
  const supported = !isProductionBuild() && typeof captureOwnerStack === "function";

  const capture = useCallback((): string | undefined => captureOwnerStack?.() ?? undefined, []);

  return { captureOwnerStack: capture, supported };
};
