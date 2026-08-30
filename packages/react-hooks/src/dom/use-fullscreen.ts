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
 * Wraps the Fullscreen API for a single element. Attach `ref` to the
 * element (for example, a video player container), then call `enter()`,
 * `exit()`, or `toggle()` — usually from a click handler, since the
 * browser requires a user action to enter fullscreen. `isFullscreen`
 * tracks whether that exact element is currently fullscreen. `supported`
 * is `false` by default (safe for server rendering) where the API doesn't
 * exist.
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
      setIsFullscreen(ref.current !== null && document.fullscreenElement === ref.current);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  return { enter, exit, isFullscreen, ref, supported, toggle };
};
