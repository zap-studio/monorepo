import { useCallback, useEffect, useRef, useState } from "react";

/** Status reported by `useScreenCapture`. */
export type ScreenCaptureStatus = "active" | "error" | "idle" | "requesting";

/** The shape returned by `useScreenCapture`. */
export interface UseScreenCaptureResult {
  error: Error | undefined;
  start: () => Promise<void>;
  status: ScreenCaptureStatus;
  stop: () => void;
  stream: MediaStream | undefined;
}

const isSupported = (): boolean =>
  typeof navigator !== "undefined" && typeof navigator.mediaDevices?.getDisplayMedia === "function";

/**
 * Wraps `navigator.mediaDevices.getDisplayMedia()` for sharing a screen,
 * window, or tab. You must call `start()` yourself from a user action,
 * like a click, since browsers require a real user gesture and this hook
 * never fakes one. The `stream` also stops itself automatically if the
 * user clicks the browser's own "Stop sharing" button, so `status` always
 * matches reality.
 *
 * @example
 * ```tsx
 * const { stream, status, start, stop } = useScreenCapture({ video: true });
 * <button onClick={start}>Share screen</button>
 * ```
 */
export const useScreenCapture = (options?: DisplayMediaStreamOptions): UseScreenCaptureResult => {
  const [stream, setStream] = useState<MediaStream | undefined>(undefined);
  const [status, setStatus] = useState<ScreenCaptureStatus>("idle");
  const [error, setError] = useState<Error | undefined>(undefined);
  const streamRef = useRef<MediaStream | null>(null);

  const optionsRef = useRef(options);
  useEffect(() => {
    optionsRef.current = options;
  });

  const stop = useCallback((): void => {
    for (const track of streamRef.current?.getTracks() ?? []) {
      track.stop();
    }
    streamRef.current = null;
    setStream(undefined);
    setStatus("idle");
  }, []);

  const start = useCallback(async (): Promise<void> => {
    if (!isSupported()) {
      setError(new Error("getDisplayMedia is not supported by this browser."));
      setStatus("error");
      return;
    }
    setStatus("requesting");
    setError(undefined);
    try {
      const media = await navigator.mediaDevices.getDisplayMedia(optionsRef.current);
      streamRef.current = media;
      setStream(media);
      setStatus("active");
      // oxlint-disable-next-line react-doctor/effect-needs-cleanup -- this listener is added to a track created inside `start()`, which runs from a user action, not from the effect below. `useEffect(() => stop, [stop])` stops every track on unmount, and the listener goes away with the track since it's never reused.
      media.getVideoTracks()[0]?.addEventListener("ended", stop);
    } catch (caught) {
      setError(caught instanceof Error ? caught : new Error(String(caught)));
      setStatus("error");
    }
  }, [stop]);

  useEffect(() => stop, [stop]);

  return { error, start, status, stop, stream };
};
