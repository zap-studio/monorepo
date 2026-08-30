import { useEffect, useLayoutEffect } from "react";

/**
 * Uses `useLayoutEffect` in the browser, and `useEffect` on the server.
 * It has the same signature as both, so you can swap it in directly.
 * `useLayoutEffect` doesn't make sense during server rendering, since
 * there is no layout to read or change, and React shows a warning if you
 * call it there. This hook picks the right one automatically, so you
 * never see that warning, and the browser behavior stays the same.
 *
 * Use this hook when your effect must run before the browser paints the
 * screen. For example: reading layout information, changing the DOM to
 * avoid a visible flash, or attaching an event listener that must not
 * miss anything the user does right after the paint.
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
