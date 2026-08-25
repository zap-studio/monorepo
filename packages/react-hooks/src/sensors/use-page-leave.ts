import { useEffect, useRef } from "react";

interface LegacyMouseEvent extends MouseEvent {
  readonly toElement?: Element | null;
}

/**
 * Calls `onPageLeave` when the pointer leaves the viewport — a `mouseout`
 * on `document` whose `relatedTarget` (and legacy `toElement`) are both
 * null, meaning the pointer left the page entirely rather than moving
 * between two elements inside it. Useful for exit-intent UI. `onPageLeave`
 * doesn't need to be memoized — the latest one is always called.
 *
 * @example
 * ```tsx
 * usePageLeave(() => setShowExitIntentModal(true));
 * ```
 */
export const usePageLeave = (onPageLeave: () => void): void => {
  const onPageLeaveRef = useRef(onPageLeave);
  useEffect(() => {
    onPageLeaveRef.current = onPageLeave;
  });

  useEffect(() => {
    const handleMouseOut = (event: MouseEvent) => {
      // SAFETY: toElement is a legacy, non-standard MouseEvent field (old IE/WebKit) not declared in TypeScript's DOM lib; read defensively as an optional field, so a browser without it just yields undefined.
      const legacyRelatedTarget = (event as LegacyMouseEvent).toElement;
      if (event.relatedTarget === null && !legacyRelatedTarget) {
        onPageLeaveRef.current();
      }
    };

    document.addEventListener("mouseout", handleMouseOut);
    return () => document.removeEventListener("mouseout", handleMouseOut);
  }, []);
};
