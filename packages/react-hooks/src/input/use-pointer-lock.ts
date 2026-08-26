import { type RefObject, useCallback, useEffect, useRef, useState } from "react";

/** The shape returned by `usePointerLock`. */
export interface UsePointerLockResult<T extends Element> {
  exit: () => void;
  locked: boolean;
  ref: RefObject<T | null>;
  request: () => Promise<void>;
  supported: boolean;
}

const isSupported = (): boolean =>
  typeof document !== "undefined" && typeof document.exitPointerLock === "function";

/**
 * Wraps the browser's Pointer Lock API for a single element. Attach
 * `ref` to the element (for example, a `<canvas>`) that should capture
 * the pointer, then call `request()` or `exit()` yourself, usually from
 * a click handler (the browser requires a user gesture to grant the
 * lock).
 *
 * `locked` tracks whether that exact element currently holds the lock,
 * by listening for `pointerlockchange`. `supported` is `false` by
 * default (safe for server-side rendering) and stays `false` where the
 * Pointer Lock API doesn't exist.
 *
 * @example
 * ```tsx
 * const { ref, locked, request, exit } = usePointerLock<HTMLCanvasElement>();
 * return <canvas ref={ref} onClick={() => request()} />;
 * ```
 */
export const usePointerLock = <T extends Element = HTMLElement>(): UsePointerLockResult<T> => {
  const supported = isSupported();
  const ref = useRef<T | null>(null);
  const [locked, setLocked] = useState(false);

  const request = useCallback(async (): Promise<void> => {
    if (!isSupported() || !ref.current) {
      return;
    }
    await ref.current.requestPointerLock();
  }, []);

  const exit = useCallback((): void => {
    if (!isSupported()) {
      return;
    }
    document.exitPointerLock();
  }, []);

  useEffect(() => {
    if (!isSupported()) {
      return undefined;
    }

    const handlePointerLockChange = () => {
      setLocked(ref.current !== null && document.pointerLockElement === ref.current);
    };

    document.addEventListener("pointerlockchange", handlePointerLockChange);
    return () => document.removeEventListener("pointerlockchange", handlePointerLockChange);
  }, []);

  return { exit, locked, ref, request, supported };
};
