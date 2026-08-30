import { type RefObject, useRef, useState } from "react";

import { useIsomorphicLayoutEffect } from "../lifecycle/use-isomorphic-layout-effect.ts";

/** The shape returned by `useHover`. */
export interface UseHoverResult<T extends HTMLElement> {
  hovered: boolean;
  ref: RefObject<T | null>;
}

/**
 * Tracks whether the mouse is hovering over a ref'd element. It listens
 * for `mouseenter` and `mouseleave` on that element. Attach `ref` to the
 * element you want to track.
 *
 * The listeners attach early, before the browser paints. This makes sure
 * a `mouseleave` event is never missed, so `hovered` does not get stuck at
 * `true`. The hook also checks `ref` again after every render, so it
 * still works if the element appears later, is conditionally rendered, or
 * gets replaced.
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
