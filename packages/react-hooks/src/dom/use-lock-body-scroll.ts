import { useIsomorphicLayoutEffect } from "../lifecycle/use-isomorphic-layout-effect.ts";

/**
 * Stops the page from scrolling in the background while `locked` is
 * `true`. This is the usual pattern behind an open modal or drawer. When
 * `locked` becomes `false`, or the component unmounts, the previous
 * `overflow` style is restored.
 *
 * The style is applied early, before the browser paints. This avoids a
 * brief moment where the background could still scroll right after the
 * modal appears.
 *
 * @example
 * ```tsx
 * useLockBodyScroll(isModalOpen);
 * ```
 */
export const useLockBodyScroll = (locked = true): void => {
  useIsomorphicLayoutEffect(() => {
    if (!locked) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [locked]);
};
