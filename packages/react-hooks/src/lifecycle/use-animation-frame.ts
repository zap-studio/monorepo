import { useEffect, useRef } from "react";

/**
 * Declarative `requestAnimationFrame` loop — calls `callback` every frame
 * with the delta time (ms) since the previous one, skipping the very
 * first frame (no delta to report yet). Auto-cancels on unmount or when
 * `enabled` becomes `false`. `callback` doesn't need to be memoized — the
 * latest one is always called, without restarting the loop.
 *
 * @example
 * ```tsx
 * useAnimationFrame((deltaMs) => setRotation((r) => r + deltaMs * 0.1));
 * ```
 */
export const useAnimationFrame = (callback: (deltaMs: number) => void, enabled = true): void => {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;
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
