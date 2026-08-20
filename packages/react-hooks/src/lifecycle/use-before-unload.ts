import { useEffect, useRef } from "react";

/**
 * Registers a `beforeunload` handler — the classic "unsaved changes"
 * navigation guard. `handler` receives the raw event; call
 * `event.preventDefault()` (and, for legacy browser support, set
 * `event.returnValue = ""`) inside it to trigger the browser's own
 * confirmation prompt. Pass `enabled: false` to detach without
 * unmounting the hook (e.g. once a form has no unsaved changes).
 * `handler` doesn't need to be memoized — the latest one is always
 * called, without re-subscribing.
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
  handlerRef.current = handler;

  useEffect(() => {
    if (!enabled) {
      return undefined;
    }

    const listener = (event: BeforeUnloadEvent) => handlerRef.current(event);
    window.addEventListener("beforeunload", listener);
    return () => window.removeEventListener("beforeunload", listener);
  }, [enabled]);
};
