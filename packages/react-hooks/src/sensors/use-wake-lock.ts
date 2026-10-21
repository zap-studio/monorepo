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
  const [sentinel, setSentinel] = useState<WakeLockSentinel | null>(null);

  const release = useCallback(async (): Promise<void> => {
    const current = sentinelRef.current;
    if (!current) {
      return;
    }
    sentinelRef.current = null;
    setSentinel(null);
    setActive(false);
    await current.release();
  }, []);

  const request = useCallback(async (): Promise<void> => {
    if (!isSupported()) {
      return;
    }
    const newSentinel = await navigator.wakeLock.request("screen");
    sentinelRef.current = newSentinel;
    setSentinel(newSentinel);
    setActive(true);
  }, []);

  useEffect(() => {
    if (!sentinel) {
      return undefined;
    }
    const handleRelease = () => {
      sentinelRef.current = null;
      setSentinel(null);
      setActive(false);
    };
    sentinel.addEventListener("release", handleRelease);
    return () => {
      sentinel.removeEventListener("release", handleRelease);
    };
  }, [sentinel]);

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
