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
 * Tracks the ref'd element's content size (width and height), using
 * `ResizeObserver`. Attach `ref` to the element you want to observe.
 * `size` starts as `undefined` — this is also the safe default for
 * server-side rendering — until the first measurement happens.
 *
 * The hook checks `ref` again after every render, so it still works if
 * the element appears later, is conditionally rendered, or gets replaced.
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
      // SAFETY: ResizeObserver calls back with one entry per element it watches. This observer only ever watches one element (see observe(element) below), so entries[0] always exists.
      const entry = entries[0]!;
      setSize({ height: entry.contentRect.height, width: entry.contentRect.width });
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, [element]);

  return { ref, size };
};
