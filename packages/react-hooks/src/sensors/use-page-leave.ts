import { useEffect, useRef } from "react";

import { useIsomorphicLayoutEffect } from "../lifecycle/use-isomorphic-layout-effect.ts";

interface LegacyMouseEvent extends MouseEvent {
  readonly toElement?: Element | null;
}

/**
 * Calls `onPageLeave` when the mouse pointer leaves the page. It listens
 * for a `mouseout` on `document` where both `relatedTarget` and the old
 * `toElement` field are null. This means the pointer left the page
 * completely, not just moved to another element on the page. Useful for
 * exit-intent popups. You don't need to memoize `onPageLeave`; the hook
 * always calls the latest version.
 *
 * @example
 * ```tsx
 * usePageLeave(() => setShowExitIntentModal(true));
 * ```
 */
export const usePageLeave = (onPageLeave: () => void): void => {
  const onPageLeaveRef = useRef(onPageLeave);
  useIsomorphicLayoutEffect(() => {
    onPageLeaveRef.current = onPageLeave;
  });

  useEffect(() => {
    const handleMouseOut = (event: MouseEvent) => {
      // SAFETY: toElement is an old, non-standard MouseEvent field (from old IE/WebKit) that TypeScript's DOM types don't include. We read it as optional, so browsers without it just give undefined.
      const legacyRelatedTarget = (event as LegacyMouseEvent).toElement;
      if (event.relatedTarget === null && !legacyRelatedTarget) {
        onPageLeaveRef.current();
      }
    };

    document.addEventListener("mouseout", handleMouseOut);
    return () => document.removeEventListener("mouseout", handleMouseOut);
  }, []);
};
