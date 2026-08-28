import { useCallback, useEffect, useMemo, useState } from "react";

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

type IdleDetectorInstance = InstanceType<
  NonNullable<ReturnType<typeof getIdleDetectorConstructor>>
>;

/** A started idle detection session: the detector plus the `AbortSignal` controller that stops it. */
interface IdleSession {
  abortController: AbortController;
  detector: IdleDetectorInstance;
}

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
 * Reads the device's `IdleDetector`. This is experimental, only works in
 * Chrome, and needs the `"idle-detection"` permission, plus a secure
 * (HTTPS) page.
 *
 * Call `start()` to ask for that permission. It resolves `false` if the
 * user denies it. Once granted, it starts reporting `userState`
 * (`"active"` or `"idle"`) and `screenState` (`"locked"` or `"unlocked"`)
 * whenever they change. Call `stop()` to turn the detector off. Both
 * states stay `undefined` until `start()` resolves `true`, which is safe
 * for server-side rendering.
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
  const [session, setSession] = useState<IdleSession | null>(null);

  const stop = useCallback(() => {
    setSession(null);
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

      const abortController = new AbortController();
      const detector = new IdleDetectorCtor();

      try {
        await detector.start({ ...options, signal: abortController.signal });
        setSession({ abortController, detector });
        setUserState(detector.userState);
        setScreenState(detector.screenState);
        return true;
      } catch {
        return false;
      }
    },
    [],
  );

  useEffect(() => {
    if (!session) {
      return undefined;
    }
    const { abortController, detector } = session;
    const handleChange = () => {
      setUserState(detector.userState);
      setScreenState(detector.screenState);
    };
    detector.addEventListener("change", handleChange);
    return () => {
      abortController.abort();
      detector.removeEventListener("change", handleChange);
    };
  }, [session]);

  return useMemo(
    () => ({ requestPermission, screenState, start, stop, supported, userState }),
    [requestPermission, screenState, start, stop, supported, userState],
  );
};
