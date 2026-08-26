import { useCallback, useEffect, useRef, useState } from "react";

/** The shape returned by `useWakeLock`. */
export interface UseWakeLockResult {
  active: boolean;
  release: () => Promise<void>;
  request: () => Promise<void>;
  supported: boolean;
}

const isSupported = (): boolean => typeof navigator !== "undefined" && Boolean(navigator.wakeLock);

/**
 * Wraps the Screen Wake Lock API. It does not turn on automatically when
 * the component mounts — call `request()` to turn it on and `release()`
 * to turn it off. It also releases automatically when the document is
 * hidden (browsers already do this, but this hook also releases on the
 * `visibilitychange` event to be safe) and when the component unmounts.
 * `supported` is `false` (the safe default for server rendering) when
 * `navigator.wakeLock` doesn't exist.
 *
 * @example
 * ```tsx
 * const { active, request, release, supported } = useWakeLock();
 * if (supported) await request(); // keep the screen awake
 * ```
 */
export const useWakeLock = (): UseWakeLockResult => {
  const supported = isSupported();
  const [active, setActive] = useState(false);
  const sentinelRef = useRef<WakeLockSentinel | null>(null);

  const release = useCallback(async (): Promise<void> => {
    const sentinel = sentinelRef.current;
    if (!sentinel) {
      return;
    }
    sentinelRef.current = null;
    setActive(false);
    await sentinel.release();
  }, []);

  const request = useCallback(async (): Promise<void> => {
    if (!isSupported()) {
      return;
    }
    const sentinel = await navigator.wakeLock.request("screen");
    sentinelRef.current = sentinel;
    setActive(true);
    // oxlint-disable-next-line react-doctor/effect-needs-cleanup -- this listener is added inside `request()`, which the user calls directly, not inside an effect's setup code. The `sentinel` is only stored in `sentinelRef` and never reused, so this listener naturally goes away once `release()` fires it (the effect below calls `release()` on unmount).
    sentinel.addEventListener("release", () => {
      sentinelRef.current = null;
      setActive(false);
    });
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        void release();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      void release();
    };
  }, [release]);

  return { active, release, request, supported };
};
