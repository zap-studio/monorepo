import { type RefObject, useRef } from "react";

import { useIsomorphicLayoutEffect } from "../lifecycle/use-isomorphic-layout-effect.ts";

/**
 * Calls `onOutside` on a `mousedown`/`touchstart` whose target falls outside
 * the ref'd element — the standard "close on outside click" pattern for
 * dropdowns, popovers, and modals. Listens on the capture phase, so it still
 * fires even if an inner handler calls `stopPropagation()`. `onOutside`
 * doesn't need to be memoized — the latest one is always called.
 *
 * The listener attaches in a layout effect, before the browser paints, so a
 * menu that opens and is clicked away from immediately can't miss that first
 * outside click.
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
