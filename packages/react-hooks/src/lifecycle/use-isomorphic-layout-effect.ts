import { useEffect, useLayoutEffect } from "react";

/**
 * `useLayoutEffect` on the client, `useEffect` on the server — same signature
 * as either, so it is a drop-in replacement. `useLayoutEffect` has no meaning
 * during server rendering (there is no layout to read or mutate), and React
 * warns when it is called there; picking the implementation once, at module
 * scope, keeps that warning away without changing client behaviour.
 *
 * Reach for it when an effect must run *before* the browser paints — reading
 * layout, mutating the DOM to avoid a visible flash, or attaching an event
 * listener that must not miss anything the user does between paint and the
 * passive effect flush.
 *
 * @example
 * ```tsx
 * useIsomorphicLayoutEffect(() => {
 *   element.scrollTop = element.scrollHeight;
 * }, [messages]);
 * ```
 */
export const useIsomorphicLayoutEffect: typeof useLayoutEffect =
  typeof document === "undefined" ? useEffect : useLayoutEffect;
