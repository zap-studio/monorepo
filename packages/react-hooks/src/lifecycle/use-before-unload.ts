import { useEffect, useRef } from "react";

/**
 * Registers a `beforeunload` handler. This is the classic "you have
 * unsaved changes" warning that browsers show before leaving a page.
 * `handler` receives the raw event. Call `event.preventDefault()` inside
 * it (and, for older browsers, set `event.returnValue = ""`) to trigger
 * the browser's confirmation prompt. Pass `enabled: false` to turn the
 * handler off without unmounting the hook, for example once a form has
 * no unsaved changes left. You don't need to memoize `handler` — the
 * hook always uses the latest version, without re-subscribing.
 *
 * @example
 * ```tsx
 * useBeforeUnload((event) => {
 *   if (isDirty) {
 *     event.preventDefault();
 *     event.returnValue = "";
 *   }
 * }, isDirty);
 * ```
 */
export const useBeforeUnload = (
  handler: (event: BeforeUnloadEvent) => void,
  enabled = true,
): void => {
  const handlerRef = useRef(handler);
  useEffect(() => {
    handlerRef.current = handler;
  });

  useEffect(() => {
    if (!enabled) {
      return undefined;
    }

    const listener = (event: BeforeUnloadEvent) => handlerRef.current(event);
    window.addEventListener("beforeunload", listener);
    return () => window.removeEventListener("beforeunload", listener);
  }, [enabled]);
};
