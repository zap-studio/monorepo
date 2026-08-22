import { type RefObject, useCallback, useEffect, useRef, useState } from "react";

/** The shape returned by `useFullscreen`. */
export interface UseFullscreenResult<T extends Element> {
  enter: () => Promise<void>;
  exit: () => Promise<void>;
  isFullscreen: boolean;
  ref: RefObject<T | null>;
  supported: boolean;
  toggle: () => Promise<void>;
}

const isSupported = (): boolean =>
  typeof document !== "undefined" && Boolean(document.fullscreenEnabled);

/**
 * Fullscreen API wrapper for a single ref'd element — attach `ref` to the
 * element (e.g. a video player container), then call `enter()`/`exit()`/
 * `toggle()` imperatively, typically from a click handler (the API
 * requires a user gesture). `isFullscreen` tracks whether that exact
 * element currently holds fullscreen, via `fullscreenchange`.
 * `supported: false` — the SSR-safe default — where the API doesn't exist.
 *
 * @example
 * ```tsx
 * const { ref, isFullscreen, toggle } = useFullscreen<HTMLDivElement>();
 * return <div ref={ref}><button onClick={toggle}>{isFullscreen ? "Exit" : "Enter"}</button></div>;
 * ```
 */
export const useFullscreen = <T extends Element = HTMLElement>(): UseFullscreenResult<T> => {
  const supported = isSupported();
  const ref = useRef<T | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const enter = useCallback(async (): Promise<void> => {
    if (!isSupported() || !ref.current) {
      return;
    }
    await ref.current.requestFullscreen();
  }, []);

  const exit = useCallback(async (): Promise<void> => {
    if (!isSupported() || document.fullscreenElement !== ref.current) {
      return;
    }
    await document.exitFullscreen();
  }, []);

  const toggle = useCallback(async (): Promise<void> => {
    if (document.fullscreenElement === ref.current) {
      await exit();
    } else {
      await enter();
    }
  }, [enter, exit]);

  useEffect(() => {
    if (!isSupported()) {
      return undefined;
    }

    const handleFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement === ref.current);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  return { enter, exit, isFullscreen, ref, supported, toggle };
};
