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

/** The `options` fields that actually change what `addEventListener` does, flattened to comparable values. */
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
 * Typed `addEventListener` wrapper with automatic cleanup — attaches
 * `handler` for `type` on `target` (a `RefObject`, a DOM node, or
 * `window`/`document`), and removes it on unmount or when the resolved
 * element, `type`, or `options` change. `handler` doesn't need to be memoized
 * — the latest one is always called, without re-subscribing. Neither does
 * `options`: it is compared field by field, so an object literal written
 * inline at the call site is free.
 *
 * The listener is attached in a layout effect, before the browser paints, so
 * no event can slip through the gap a passive effect would leave open. When
 * `target` is a ref, its `current` is re-read on every commit, so a ref that
 * is still `null` on the first render — or that later points at a different
 * element — is picked up as soon as React commits the change.
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

  useIsomorphicLayoutEffect(() => {
    if (!element) {
      return undefined;
    }

    const listenerOptions: AddEventListenerOptions = { capture, once };
    if (passive !== undefined) {
      listenerOptions.passive = passive;
    }
    if (signal !== undefined) {
      listenerOptions.signal = signal;
    }

    // SAFETY: addEventListener's native `Event` is narrowed to `E` on the caller's word — TypeScript can't derive `E` from a runtime string `type`, so this trusts the caller's explicit type parameter (or its `Event` default).
    const listener = (event: Event) => handlerRef.current(event as E);
    element.addEventListener(type, listener, listenerOptions);
    return () => element.removeEventListener(type, listener, { capture });
  }, [element, type, capture, once, passive, signal]);
};
