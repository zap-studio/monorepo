import { type RefObject, useRef } from "react";

import { useIsomorphicLayoutEffect } from "../lifecycle/use-isomorphic-layout-effect.ts";

/**
 * Calls `onOutside` when the user clicks or taps outside the element you
 * attach the returned ref to. This is the usual way to close dropdowns,
 * popovers, and modals when the user clicks away from them.
 *
 * The listener uses the capture phase, so it still fires even if some other
 * click handler calls `stopPropagation()`. You don't need to memoize
 * `onOutside` — the hook always calls the latest version you passed in.
 *
 * The listener is attached before the browser paints the screen, so it can
 * catch a click that happens right after the menu opens.
 *
 * @example
 * ```tsx
 * const ref = useClickOutside<HTMLDivElement>(() => setOpen(false));
 * return open ? <div ref={ref}>Menu</div> : null;
 * ```
 */
export const useClickOutside = <T extends HTMLElement = HTMLElement>(
  onOutside: (event: MouseEvent | TouchEvent) => void,
): RefObject<T | null> => {
  const ref = useRef<T | null>(null);
  const onOutsideRef = useRef(onOutside);
  useIsomorphicLayoutEffect(() => {
    onOutsideRef.current = onOutside;
  });

  useIsomorphicLayoutEffect(() => {
    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      const element = ref.current;
      const target = event.target;
      if (!element || !(target instanceof Node) || element.contains(target)) {
        return;
      }
      onOutsideRef.current(event);
    };

    document.addEventListener("mousedown", handlePointerDown, { capture: true });
    document.addEventListener("touchstart", handlePointerDown, { capture: true, passive: true });
    return () => {
      document.removeEventListener("mousedown", handlePointerDown, { capture: true });
      document.removeEventListener("touchstart", handlePointerDown, { capture: true });
    };
  }, []);

  return ref;
};
