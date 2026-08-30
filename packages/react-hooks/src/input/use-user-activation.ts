import { useCallback, useRef, useSyncExternalStore } from "react";

/** The shape returned by `useUserActivation`. */
export interface UserActivationState {
  hasBeenActive: boolean;
  isActive: boolean;
}

const FALLBACK_STATE: UserActivationState = { hasBeenActive: false, isActive: false };

const readState = (): UserActivationState => {
  const activation = navigator.userActivation;
  return activation
    ? { hasBeenActive: activation.hasBeenActive, isActive: activation.isActive }
    : FALLBACK_STATE;
};

const statesEqual = (a: UserActivationState, b: UserActivationState): boolean =>
  a.hasBeenActive === b.hasBeenActive && a.isActive === b.isActive;

const getServerSnapshot = (): UserActivationState => FALLBACK_STATE;

const ACTIVATION_EVENTS = ["pointerdown", "pointerup", "keydown"] as const;

const subscribe = (onStoreChange: () => void) => {
  for (const type of ACTIVATION_EVENTS) {
    window.addEventListener(type, onStoreChange, true);
  }
  return () => {
    for (const type of ACTIVATION_EVENTS) {
      window.removeEventListener(type, onStoreChange, true);
    }
  };
};

/**
 * Reads `navigator.userActivation`'s `hasBeenActive` and `isActive`
 * flags. These tell you whether the page has ever had, or currently
 * has, a "user activation" — a click, key press, or similar gesture.
 * This is useful for gating things like autoplay or popups, which
 * browsers block outside of a user gesture.
 *
 * There's no native event for when user activation changes, so this
 * hook re-checks on the same gesture events that create it
 * (`pointerdown`, `pointerup`, `keydown`). It listens during the capture
 * phase, so it still sees the gesture even if something else stops the
 * event from bubbling.
 *
 * Falls back to `{ isActive: false, hasBeenActive: false }` during
 * server rendering, before the client subscribes, and where this API
 * isn't supported.
 *
 * @example
 * ```tsx
 * const { isActive } = useUserActivation();
 * if (isActive) audio.play(); // gate autoplay behind a real user gesture
 * ```
 */
export const useUserActivation = (): UserActivationState => {
  const cacheRef = useRef<UserActivationState>(FALLBACK_STATE);

  const getSnapshot = useCallback((): UserActivationState => {
    const next = readState();
    if (!statesEqual(cacheRef.current, next)) {
      cacheRef.current = next;
    }
    return cacheRef.current;
  }, []);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
};
