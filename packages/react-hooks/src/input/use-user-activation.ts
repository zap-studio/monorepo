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
 * `navigator.userActivation`'s `hasBeenActive`/`isActive` — whether the
 * page has ever/is currently within a user-activation window (a click, key
 * press, or similar gesture), useful to gate autoplay/popups browsers
 * block outside one. There's no native change event for user activation,
 * so this re-checks on the same gesture events that set it (`pointerdown`,
 * `pointerup`, `keydown`, captured so it observes the gesture even if a
 * listener elsewhere stops propagation). Falls back to
 * `{ isActive: false, hasBeenActive: false }` during server rendering,
 * before the client subscribes, and where the API is unsupported.
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
