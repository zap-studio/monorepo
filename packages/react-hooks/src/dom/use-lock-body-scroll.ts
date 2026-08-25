import { useIsomorphicLayoutEffect } from "../lifecycle/use-isomorphic-layout-effect.ts";

/**
 * Locks `document.body`'s scroll while `locked` is `true` — the standard
 * "no background scroll behind an open modal/drawer" pattern. Restores the
 * body's previous inline `overflow` on unlock or unmount. The style is
 * applied in a layout effect, before the browser paints, so the background
 * can't be scrolled for the frame between the modal appearing and the lock
 * taking hold.
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
