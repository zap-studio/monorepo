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
 * Screen Wake Lock API wrapper — not auto-acquired on mount; call
 * `request()`/`release()` imperatively. Automatically released when the
 * document is hidden (per spec the platform already does this, but this
 * also proactively releases on `visibilitychange`) and on unmount.
 * `supported: false` — the SSR-safe default — where `navigator.wakeLock`
 * doesn't exist.
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
    // oxlint-disable-next-line react-doctor/effect-needs-cleanup -- registered on a per-call `sentinel` inside a user-triggered `request()`, not the effect's mount body; the sentinel is never stored beyond `sentinelRef` or reused, so this one-shot listener dies with it once `release()` (called on unmount by the effect below) fires it.
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
