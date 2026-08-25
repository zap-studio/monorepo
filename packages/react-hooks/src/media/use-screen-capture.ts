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
 * Wraps `navigator.mediaDevices.getDisplayMedia()` — screen/window/tab
 * sharing. Manual `start()` only, since the browser requires (and this
 * hook never fakes) a real user gesture to grant it; `stream` also stops
 * itself automatically when the browser's own "Stop sharing" bar ends the
 * track, keeping `status` in sync with reality.
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
      const media = await navigator.mediaDevices.getDisplayMedia(options);
      streamRef.current = media;
      setStream(media);
      setStatus("active");
      // oxlint-disable-next-line react-doctor/effect-needs-cleanup -- registered on a per-call track inside a user-triggered `start()`, not the effect's mount body; `useEffect(() => stop, [stop])` below stops every track on unmount, and the listener dies with the track since it's never reused.
      media.getVideoTracks()[0]?.addEventListener("ended", stop);
    } catch (caught) {
      setError(caught instanceof Error ? caught : new Error(String(caught)));
      setStatus("error");
    }
  }, [options, stop]);

  useEffect(() => stop, [stop]);

  return { error, start, status, stop, stream };
};
