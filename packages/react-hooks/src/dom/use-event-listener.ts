import { type RefObject, useRef, useState } from "react";

import { useIsomorphicLayoutEffect } from "../lifecycle/use-isomorphic-layout-effect.ts";

/** Anything `useEventListener` can attach to: a DOM node, `window`/`document`, or a ref to one. */
export type EventListenerTarget =
  | Document
  | EventTarget
  | RefObject<EventTarget | null>
  | Window
  | null
  | undefined;

/** The `options` fields that actually change how `addEventListener` behaves, kept as plain values so we can compare them easily. */
type NormalizedOptions = {
  capture: boolean;
  once: boolean;
  passive?: boolean;
  signal?: AbortSignal;
};

const resolveTarget = (target: EventListenerTarget): EventTarget | null => {
  if (!target) {
    return null;
  }
  return "current" in target ? target.current : target;
};

const normalizeOptions = (
  options: AddEventListenerOptions | boolean | undefined,
): NormalizedOptions => {
  if (typeof options === "boolean") {
    return { capture: options, once: false };
  }
  const normalized: NormalizedOptions = {
    capture: options?.capture ?? false,
    once: options?.once ?? false,
  };
  if (options?.passive !== undefined) {
    normalized.passive = options.passive;
  }
  if (options?.signal !== undefined) {
    normalized.signal = options.signal;
  }
  return normalized;
};

/**
 * A typed `addEventListener` wrapper that cleans up after itself. It attaches
 * `handler` for the given `type` on `target` (a `RefObject`, a DOM node, or
 * `window`/`document`). It removes the listener when the component unmounts,
 * or when the resolved element, `type`, or `options` change.
 *
 * You don't need to memoize `handler` or `options` — the hook always uses the
 * latest values you pass in, without re-attaching the listener. You can even
 * pass a new `options` object literal on every render for free.
 *
 * The listener attaches before the browser paints, so it never misses an
 * early event. When `target` is a ref, the hook checks `ref.current` again on
 * every render, so it still works if the ref is `null` at first, or later
 * points to a different element.
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
  useIsomorphicLayoutEffect(() => {
    handlerRef.current = handler;
  });

  const [element, setElement] = useState<EventTarget | null>(null);
  useIsomorphicLayoutEffect(() => {
    setElement(resolveTarget(target));
  });

  const { capture, once, passive, signal } = normalizeOptions(options);

  // react-doctor-disable-next-line react-doctor/effect-needs-cleanup -- cleanup is returned below (removeEventListener); the early-return branch has nothing to clean up.
  useIsomorphicLayoutEffect(() => {
    if (!element) {
      return undefined;
    }

    // SAFETY: we trust the caller's type parameter `E` here. TypeScript can't figure out `E` from a runtime string like `type`, so we cast the native `Event` to `E` based on what the caller declared (or the default `Event` type).
    const listener = (event: Event) => handlerRef.current(event as E);
    const listenerOptions: AddEventListenerOptions = {
      capture,
      once,
      ...(passive !== undefined && { passive }),
      ...(signal !== undefined && { signal }),
    };
    element.addEventListener(type, listener, listenerOptions);
    return () => {
      element.removeEventListener(type, listener, listenerOptions);
    };
  }, [element, type, capture, once, passive, signal]);
};
