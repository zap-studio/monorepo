import { useEffect } from "react";

/**
 * Locks `document.body`'s scroll while `locked` is `true` — the standard
 * "no background scroll behind an open modal/drawer" pattern. Restores the
 * body's previous inline `overflow` on unlock or unmount.
 *
 * @example
 * ```tsx
 * useLockBodyScroll(isModalOpen);
 * ```
 */
export const useLockBodyScroll = (locked = true): void => {
  useEffect(() => {
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
