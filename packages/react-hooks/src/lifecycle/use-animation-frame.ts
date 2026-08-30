import { useEffect, useRef } from "react";

/**
 * Runs `callback` on every animation frame, using `requestAnimationFrame`.
 * It passes the time (in ms) since the last frame. The first frame is
 * skipped because there is no previous time yet. The loop stops
 * automatically when the component unmounts or when `enabled` becomes
 * `false`. You don't need to memoize `callback` — the hook always uses
 * the latest version, without restarting the loop.
 *
 * @example
 * ```tsx
 * useAnimationFrame((deltaMs) => setRotation((r) => r + deltaMs * 0.1));
 * ```
 */
export const useAnimationFrame = (callback: (deltaMs: number) => void, enabled = true): void => {
  const callbackRef = useRef(callback);
  useEffect(() => {
    callbackRef.current = callback;
  });
  const previousTimeRef = useRef<number | null>(null);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    if (!enabled) {
      return undefined;
    }

    const loop = (time: number) => {
      if (previousTimeRef.current !== null) {
        callbackRef.current(time - previousTimeRef.current);
      }
      previousTimeRef.current = time;
      frameRef.current = requestAnimationFrame(loop);
    };

    frameRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(frameRef.current);
      previousTimeRef.current = null;
    };
  }, [enabled]);
};
