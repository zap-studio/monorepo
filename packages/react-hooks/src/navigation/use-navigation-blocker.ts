import { useCallback, useEffect, useRef, useState } from "react";

import { useIsomorphicLayoutEffect } from "../lifecycle/use-isomorphic-layout-effect.ts";
import { getNavigation } from "./_navigation-api.ts";

/** The shape returned by `useNavigationBlocker`. */
export interface NavigationBlockerResult {
  blocked: boolean;
  proceed: () => void;
  reset: () => void;
}

/**
 * Wraps the Navigation API's `navigate` event to block or confirm
 * in-app route changes. `shouldBlock` receives the destination URL and
 * returns `true` to hold the navigation, or `false` to let it continue.
 * While `blocked` is `true`, the navigation is paused. Call `proceed()`
 * to let it finish, or call `reset()` to clear the blocked state (this
 * leaves the navigation itself paused, so only use `reset()` together
 * with a `shouldBlock` that stops blocking once its condition is no
 * longer met).
 *
 * This is different from `useBeforeUnload`, which only guards full page
 * unloads or tab closes. This hook guards in-app route changes, which
 * never trigger `beforeunload`. You don't need to memoize `shouldBlock` —
 * the hook always uses the latest version, without re-subscribing. In
 * browsers without the Navigation API (Safari, Firefox), this hook does
 * nothing and never blocks.
 *
 * @example
 * ```tsx
 * const { blocked, proceed, reset } = useNavigationBlocker(() => isDirty);
 * if (blocked) return <ConfirmLeaveDialog onConfirm={proceed} onCancel={reset} />;
 * ```
 */
export const useNavigationBlocker = (
  shouldBlock: (destinationUrl: string) => boolean,
): NavigationBlockerResult => {
  const [blocked, setBlocked] = useState(false);
  const shouldBlockRef = useRef(shouldBlock);
  useIsomorphicLayoutEffect(() => {
    shouldBlockRef.current = shouldBlock;
  });
  const resolveRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const nav = getNavigation();
    if (!nav) {
      return undefined;
    }

    const waitForProceed = (): Promise<void> =>
      new Promise((resolve) => {
        resolveRef.current = resolve;
      });

    const handleNavigate = (event: Event) => {
      // SAFETY: this listener is only ever added for the "navigate" event, so the event object always matches NavigateEvent at runtime. Navigation's addEventListener isn't overloaded per event name, so TypeScript only gives us the base Event type here.
      const navigateEvent = event as NavigateEvent;
      if (
        !navigateEvent.canIntercept ||
        navigateEvent.hashChange ||
        navigateEvent.downloadRequest !== null
      ) {
        return;
      }
      if (!shouldBlockRef.current(navigateEvent.destination.url)) {
        return;
      }
      navigateEvent.intercept({ handler: waitForProceed });
      setBlocked(true);
    };

    nav.addEventListener("navigate", handleNavigate);
    return () => nav.removeEventListener("navigate", handleNavigate);
  }, []);

  const proceed = useCallback((): void => {
    resolveRef.current?.();
    resolveRef.current = null;
    setBlocked(false);
  }, []);

  const reset = useCallback((): void => {
    resolveRef.current = null;
    setBlocked(false);
  }, []);

  return { blocked, proceed, reset };
};
