import { useCallback, useRef, useSyncExternalStore } from "react";

/** The shape returned by `usePopState`. */
export interface PopState {
  pathname: string;
  state: unknown;
}

const FALLBACK_POP_STATE: PopState = { pathname: "/", state: null };

const readPopState = (): PopState => ({ pathname: location.pathname, state: history.state });

const popStatesEqual = (a: PopState, b: PopState): boolean =>
  a.pathname === b.pathname && Object.is(a.state, b.state);

const getServerSnapshot = (): PopState => FALLBACK_POP_STATE;

const subscribe = (onStoreChange: () => void) => {
  window.addEventListener("popstate", onStoreChange);
  return () => window.removeEventListener("popstate", onStoreChange);
};

/**
 * Tracks `location.pathname`/`history.state`, updating on the `popstate`
 * event — fired only by browser back/forward navigation (and
 * `history.back()`/`forward()`/`go()`), never by the `pushState`/
 * `replaceState` calls a client-side router makes itself. Falls back to
 * `{ pathname: "/", state: null }` during server rendering and before the
 * client subscribes.
 *
 * @example
 * ```tsx
 * const { pathname } = usePopState();
 * ```
 */
export const usePopState = (): PopState => {
  const cacheRef = useRef<PopState>(FALLBACK_POP_STATE);

  const getSnapshot = useCallback((): PopState => {
    const next = readPopState();
    if (!popStatesEqual(cacheRef.current, next)) {
      cacheRef.current = next;
    }
    return cacheRef.current;
  }, []);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
};
