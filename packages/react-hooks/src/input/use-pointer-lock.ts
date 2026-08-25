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
 * Pointer Lock API wrapper for a single ref'd element — attach `ref` to the
 * element (e.g. a `<canvas>`) that should capture the pointer, then call
 * `request()`/`exit()` imperatively, typically from a click handler (the
 * API requires a user gesture). `locked` tracks whether that exact element
 * currently holds the lock, via `pointerlockchange`. `supported: false` —
 * the SSR-safe default — where the Pointer Lock API doesn't exist.
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
