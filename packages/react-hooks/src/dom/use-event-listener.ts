import { type RefObject, useEffect, useRef } from "react";

/** Anything `useEventListener` can attach to: a DOM node, `window`/`document`, or a ref to one. */
export type EventListenerTarget =
  | Document
  | EventTarget
  | RefObject<EventTarget | null>
  | Window
  | null
  | undefined;

const resolveTarget = (target: EventListenerTarget): EventTarget | null => {
  if (!target) {
    return null;
  }
  return "current" in target ? target.current : target;
};

/**
 * Typed `addEventListener` wrapper with automatic cleanup — attaches
 * `handler` for `type` on `target` (a `RefObject`, a DOM node, or
 * `window`/`document`), and removes it on unmount or when `target`/`type`/
 * `options` change. `handler` doesn't need to be memoized — the latest one
 * is always called, without re-subscribing.
 *
 * @example
 * ```tsx
 * const ref = useRef<HTMLDivElement>(null);
 * useEventListener(ref, "scroll", (event) => console.log(event));
 * useEventListener(window, "resize", () => console.log("resized"));
 * ```
 */
export const useEventListener = <E extends Event = Event>(
  target: EventListenerTarget,
  type: string,
  handler: (event: E) => void,
  options?: AddEventListenerOptions | boolean,
): void => {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    const element = resolveTarget(target);
    if (!element) {
      return undefined;
    }

    // SAFETY: addEventListener's native `Event` is narrowed to `E` on the caller's word — TypeScript can't derive `E` from a runtime string `type`, so this trusts the caller's explicit type parameter (or its `Event` default).
    const listener = (event: Event) => handlerRef.current(event as E);
    element.addEventListener(type, listener, options);
    return () => element.removeEventListener(type, listener, options);
  }, [target, type, options]);
};
