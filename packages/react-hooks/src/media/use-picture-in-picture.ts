import { type RefObject, useCallback, useEffect, useRef, useState } from "react";

import { useIsomorphicLayoutEffect } from "../lifecycle/use-isomorphic-layout-effect.ts";

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
 * Picture-in-Picture wrapper for one `<video>` element. Attach `ref` to
 * the element, then call `enter()` or `exit()` yourself, usually from a
 * click handler. `active` tells you if that exact video is currently
 * floating in Picture-in-Picture. It listens to the video's own
 * `enterpictureinpicture` and `leavepictureinpicture` events, so it stays
 * correct even if the user closes the browser's native PiP window
 * directly. `supported` is `false` by default (safe for server-side
 * rendering) when the API doesn't exist.
 *
 * React reads `ref` again after every render, so a `<video>` that appears
 * later (like an async source or a playlist change) is tracked as soon as
 * React commits it.
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
    if (!isSupported() || !ref.current || document.pictureInPictureElement !== ref.current) {
      return;
    }
    await document.exitPictureInPicture();
  }, []);

  const [element, setElement] = useState<T | null>(null);
  useIsomorphicLayoutEffect(() => {
    setElement(ref.current);
  });

  useEffect(() => {
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
  }, [element]);

  return { active, enter, exit, ref, supported };
};
