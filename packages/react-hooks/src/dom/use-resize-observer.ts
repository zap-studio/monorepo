import { type RefObject, useEffect, useRef, useState } from "react";

import { useIsomorphicLayoutEffect } from "../lifecycle/use-isomorphic-layout-effect.ts";

/** The size fields `useResizeObserver` reports. */
export interface ElementSize {
  height: number;
  width: number;
}

/** The shape returned by `useResizeObserver`. */
export interface UseResizeObserverResult<T extends Element> {
  ref: RefObject<T | null>;
  size: ElementSize | undefined;
}

const isSupported = (): boolean => typeof ResizeObserver !== "undefined";

/**
 * Tracks the ref'd element's content-box size via `ResizeObserver`. Attach
 * `ref` to the element to observe. `size` starts `undefined` — the
 * SSR-safe default — until the first observation fires.
 *
 * `ref` is re-read on every commit, so an element rendered conditionally,
 * mounted later, or swapped for another one is observed as soon as React
 * commits the change.
 *
 * @example
 * ```tsx
 * const { ref, size } = useResizeObserver<HTMLDivElement>();
 * return <div ref={ref}>{size?.width}×{size?.height}</div>;
 * ```
 */
export const useResizeObserver = <
  T extends Element = HTMLElement,
>(): UseResizeObserverResult<T> => {
  const ref = useRef<T | null>(null);
  const [size, setSize] = useState<ElementSize | undefined>(undefined);

  const [element, setElement] = useState<T | null>(null);
  useIsomorphicLayoutEffect(() => {
    setElement(ref.current);
  });

  useEffect(() => {
    if (!isSupported() || !element) {
      return undefined;
    }

    const observer = new ResizeObserver((entries) => {
      // SAFETY: ResizeObserver invokes its callback with one entry per observed target, and this observer only ever observes a single element via observe(element) below, so entries[0] is always present.
      const entry = entries[0]!;
      setSize({ height: entry.contentRect.height, width: entry.contentRect.width });
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, [element]);

  return { ref, size };
};
