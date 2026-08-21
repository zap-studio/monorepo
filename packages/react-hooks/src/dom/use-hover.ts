import { type RefObject, useEffect, useRef, useState } from "react";

/** The shape returned by `useHover`. */
export interface UseHoverResult<T extends HTMLElement> {
  hovered: boolean;
  ref: RefObject<T | null>;
}

/**
 * Boolean hover state for a single ref'd element, via `mouseenter`/
 * `mouseleave` on that element. Attach `ref` to the element to track.
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

  useEffect(() => {
    const element = ref.current;
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
  }, []);

  return { hovered, ref };
};
