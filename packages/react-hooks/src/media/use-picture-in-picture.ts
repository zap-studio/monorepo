import { type RefObject, useCallback, useEffect, useRef, useState } from "react";

/** The shape returned by `usePictureInPicture`. */
export interface UsePictureInPictureResult<T extends HTMLVideoElement> {
  active: boolean;
  enter: () => Promise<void>;
  exit: () => Promise<void>;
  ref: RefObject<T | null>;
  supported: boolean;
}

const isSupported = (): boolean =>
  typeof document !== "undefined" && Boolean(document.pictureInPictureEnabled);

/**
 * Picture-in-Picture wrapper for a single ref'd `<video>` — attach `ref`
 * to the element, then call `enter()`/`exit()` imperatively (typically
 * from a click handler). `active` tracks whether that exact element
 * currently floats in PiP, via its own `enterpictureinpicture`/
 * `leavepictureinpicture` events (which also fire when the browser's
 * native PiP window is closed directly, keeping state in sync).
 * `supported: false` — the SSR-safe default — where the API doesn't exist.
 *
 * @example
 * ```tsx
 * const { ref, active, enter, exit } = usePictureInPicture<HTMLVideoElement>();
 * return <video ref={ref} onDoubleClick={() => (active ? exit() : enter())} />;
 * ```
 */
export const usePictureInPicture = <
  T extends HTMLVideoElement = HTMLVideoElement,
>(): UsePictureInPictureResult<T> => {
  const supported = isSupported();
  const ref = useRef<T | null>(null);
  const [active, setActive] = useState(false);

  const enter = useCallback(async (): Promise<void> => {
    if (!isSupported() || !ref.current) {
      return;
    }
    await ref.current.requestPictureInPicture();
  }, []);

  const exit = useCallback(async (): Promise<void> => {
    if (!isSupported() || document.pictureInPictureElement !== ref.current) {
      return;
    }
    await document.exitPictureInPicture();
  }, []);

  useEffect(() => {
    const element = ref.current;
    if (!isSupported() || !element) {
      return undefined;
    }

    const handleEnter = () => setActive(true);
    const handleLeave = () => setActive(false);

    element.addEventListener("enterpictureinpicture", handleEnter);
    element.addEventListener("leavepictureinpicture", handleLeave);
    return () => {
      element.removeEventListener("enterpictureinpicture", handleEnter);
      element.removeEventListener("leavepictureinpicture", handleLeave);
    };
  }, []);

  return { active, enter, exit, ref, supported };
};
