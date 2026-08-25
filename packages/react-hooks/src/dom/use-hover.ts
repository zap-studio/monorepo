import { type RefObject, useRef, useState } from "react";

import { useIsomorphicLayoutEffect } from "../lifecycle/use-isomorphic-layout-effect.ts";

/** The shape returned by `useHover`. */
export interface UseHoverResult<T extends HTMLElement> {
  hovered: boolean;
  ref: RefObject<T | null>;
}

/**
 * Boolean hover state for a single ref'd element, via `mouseenter`/
 * `mouseleave` on that element. Attach `ref` to the element to track.
 *
 * The listeners attach in a layout effect, before the browser paints, so a
 * `mouseleave` can't be missed and leave `hovered` stuck at `true`. `ref` is
 * re-read on every commit, so an element rendered conditionally, mounted
 * later, or swapped for another one is tracked as soon as React commits the
 * change.
 *
 * @example
 * ```tsx
 * const { ref, hovered } = useHover<HTMLDivElement>();
 * return <div ref={ref}>{hovered ? "Hovering" : "Not hovering"}</div>;
 * ```
 */
export const useHover = <T extends HTMLElement = HTMLElement>(): UseHoverResult<T> => {
  const ref = useRef<T | null>(null);
  const [hovered, setHovered] = useState(false);

  const [element, setElement] = useState<T | null>(null);
  useIsomorphicLayoutEffect(() => {
    setElement(ref.current);
  });

  useIsomorphicLayoutEffect(() => {
    if (!element) {
      return undefined;
    }

    const handleEnter = () => setHovered(true);
    const handleLeave = () => setHovered(false);

    element.addEventListener("mouseenter", handleEnter);
    element.addEventListener("mouseleave", handleLeave);
    return () => {
      element.removeEventListener("mouseenter", handleEnter);
      element.removeEventListener("mouseleave", handleLeave);
    };
  }, [element]);

  return { hovered, ref };
};
