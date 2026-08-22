import { useCallback, useEffect, useRef, useState } from "react";

import { getNavigation, type NavigateEvent } from "./_navigation-api.ts";

/** The shape returned by `useNavigationBlocker`. */
export interface NavigationBlockerResult {
  blocked: boolean;
  proceed: () => void;
  reset: () => void;
}

/**
 * Wraps the Navigation API's `navigate` event and `event.intercept()` to
 * block/confirm in-app client-side route transitions — `shouldBlock`
 * receives the destination URL and returns whether to hold the
 * transition. While `blocked` is `true`, the navigation is intercepted
 * and pending; call `proceed()` to let it complete, or `reset()` to
 * clear the blocked state (the pending transition itself stays
 * suspended — recommended only alongside a `shouldBlock` that stops
 * blocking once the guard condition clears). Distinct from
 * `useBeforeUnload`: that guards full page unload/tab close, this guards
 * SPA route changes that never hit `beforeunload`. `shouldBlock` doesn't
 * need to be memoized — the latest one is always called, without
 * re-subscribing. No-ops (never blocks) in browsers without the
 * Navigation API (Safari, Firefox).
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
  shouldBlockRef.current = shouldBlock;
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
      // SAFETY: this listener is only ever registered for Navigation's "navigate" event, whose event object is always shaped like NavigateEvent at runtime, even though that type is modeled locally rather than pulled from TypeScript's DOM lib (see _navigation-api.ts).
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
