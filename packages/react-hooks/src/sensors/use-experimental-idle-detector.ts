import { useCallback, useEffect, useRef, useState } from "react";

import {
  getIdleDetectorConstructor,
  type IdleDetectorStartOptions,
  type IdleScreenState,
  type IdleUserState,
} from "./_idle-detection-api.ts";

export type {
  IdleDetectorStartOptions,
  IdleScreenState,
  IdleUserState,
} from "./_idle-detection-api.ts";

/** The shape returned by `useExperimentalIdleDetector`. */
export interface UseExperimentalIdleDetectorResult {
  requestPermission: () => Promise<boolean>;
  screenState: IdleScreenState | undefined;
  start: (options?: Omit<IdleDetectorStartOptions, "signal">) => Promise<boolean>;
  stop: () => void;
  supported: boolean;
  userState: IdleUserState | undefined;
}

/**
 * Wraps the Idle Detection API's `IdleDetector` — Experimental per MDN,
 * Chromium-only, requires the `"idle-detection"` permission and a secure
 * context. `start()` requests that permission (via the constructor's
 * static `requestPermission()`, resolving `false` if denied) then begins
 * reporting `userState` (`"active"`/`"idle"`) and `screenState`
 * (`"locked"`/`"unlocked"`) as they change; `stop()` tears the detector
 * down. Both states stay `undefined` — the SSR-safe default — until
 * `start()` resolves `true`.
 *
 * @example
 * ```tsx
 * const { userState, screenState, start, supported } = useExperimentalIdleDetector();
 * <button onClick={() => start({ threshold: 60_000 })} disabled={!supported}>
 *   Watch for idle
 * </button>
 * ```
 */
export const useExperimentalIdleDetector = (): UseExperimentalIdleDetectorResult => {
  const supported = Boolean(getIdleDetectorConstructor());
  const [userState, setUserState] = useState<IdleUserState | undefined>(undefined);
  const [screenState, setScreenState] = useState<IdleScreenState | undefined>(undefined);
  const cleanupRef = useRef<(() => void) | null>(null);

  const stop = useCallback(() => {
    cleanupRef.current?.();
    cleanupRef.current = null;
    setUserState(undefined);
    setScreenState(undefined);
  }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    const IdleDetectorCtor = getIdleDetectorConstructor();
    if (!IdleDetectorCtor) {
      return false;
    }
    return (await IdleDetectorCtor.requestPermission()) === "granted";
  }, []);

  const start = useCallback(
    async (options?: Omit<IdleDetectorStartOptions, "signal">): Promise<boolean> => {
      const IdleDetectorCtor = getIdleDetectorConstructor();
      if (!IdleDetectorCtor) {
        return false;
      }
      if ((await IdleDetectorCtor.requestPermission()) !== "granted") {
        return false;
      }

      cleanupRef.current?.();

      const abortController = new AbortController();
      const detector = new IdleDetectorCtor();

      const handleChange = () => {
        setUserState(detector.userState);
        setScreenState(detector.screenState);
      };
      // oxlint-disable-next-line react-doctor/effect-needs-cleanup -- registered inside a user-triggered `start()`, not the effect's mount body; `cleanupRef` (invoked here, in `stop()`, in the catch below, and on unmount by the effect further down) always removes this listener, just via indirection the detector's matcher misses.
      detector.addEventListener("change", handleChange);
      cleanupRef.current = () => {
        abortController.abort();
        detector.removeEventListener("change", handleChange);
      };

      try {
        await detector.start({ ...options, signal: abortController.signal });
        handleChange();
        return true;
      } catch {
        cleanupRef.current?.();
        cleanupRef.current = null;
        return false;
      }
    },
    [],
  );

  useEffect(() => () => cleanupRef.current?.(), []);

  return { requestPermission, screenState, start, stop, supported, userState };
};
