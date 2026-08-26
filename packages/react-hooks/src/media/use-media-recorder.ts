import { useCallback, useEffect, useRef, useState } from "react";

/** Status reported by `useMediaRecorder`. */
export type MediaRecorderStatus = "inactive" | "paused" | "recording";

/** The shape returned by `useMediaRecorder`. */
export interface UseMediaRecorderResult {
  blob: Blob | undefined;
  error: Error | undefined;
  isTypeSupported: (mimeType: string) => boolean;
  pause: () => void;
  resume: () => void;
  start: () => void;
  status: MediaRecorderStatus;
  stop: () => void;
  supported: boolean;
}

const isSupported = (): boolean => typeof MediaRecorder !== "undefined";

const isTypeSupported = (mimeType: string): boolean =>
  isSupported() && MediaRecorder.isTypeSupported(mimeType);

/**
 * Wraps the MediaStream Recording API around an existing `stream` (for
 * example, one from `useUserMedia`, `useCamera`, or `useScreenCapture`).
 * You call `start()`, `stop()`, `pause()`, and `resume()` yourself. The
 * `blob` is built once recording stops. `supported` is `false` by default
 * (safe for server-side rendering) when `MediaRecorder` doesn't exist.
 * `isTypeSupported(mimeType)` tells you if a given MIME type can be
 * recorded.
 *
 * @example
 * ```tsx
 * const { stream } = useCamera();
 * const { start, stop, blob, status } = useMediaRecorder(stream);
 * ```
 */
export const useMediaRecorder = (
  stream: MediaStream | undefined,
  options?: MediaRecorderOptions,
): UseMediaRecorderResult => {
  const supported = isSupported();
  const [status, setStatus] = useState<MediaRecorderStatus>("inactive");
  const [blob, setBlob] = useState<Blob | undefined>(undefined);
  const [error, setError] = useState<Error | undefined>(undefined);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const optionsRef = useRef(options);
  useEffect(() => {
    optionsRef.current = options;
  });

  const start = useCallback((): void => {
    if (!isSupported() || !stream) {
      return;
    }
    setError(undefined);
    setBlob(undefined);
    chunksRef.current = [];

    const recorder = new MediaRecorder(stream, optionsRef.current);
    // oxlint-disable-next-line react-doctor/effect-needs-cleanup -- these listeners are added to a new `recorder` created inside `start()`, which runs from a user action, not from the effect below. The unmount effect stops the recorder, and its listeners go away with it since the recorder is never reused.
    recorder.addEventListener("dataavailable", (event: BlobEvent) => {
      if (event.data.size > 0) {
        chunksRef.current.push(event.data);
      }
    });
    recorder.addEventListener("stop", () => {
      setBlob(new Blob(chunksRef.current, { type: recorder.mimeType }));
      setStatus("inactive");
    });
    recorder.addEventListener("error", () => {
      setError(new Error("MediaRecorder encountered an error."));
      setStatus("inactive");
    });

    recorder.start();
    recorderRef.current = recorder;
    setStatus("recording");
  }, [stream]);

  const stop = useCallback((): void => {
    recorderRef.current?.stop();
  }, []);

  const pause = useCallback((): void => {
    if (recorderRef.current?.state === "recording") {
      recorderRef.current.pause();
      setStatus("paused");
    }
  }, []);

  const resume = useCallback((): void => {
    if (recorderRef.current?.state === "paused") {
      recorderRef.current.resume();
      setStatus("recording");
    }
  }, []);

  useEffect(
    () => () => {
      if (recorderRef.current?.state !== "inactive") {
        recorderRef.current?.stop();
      }
    },
    [],
  );

  return { blob, error, isTypeSupported, pause, resume, start, status, stop, supported };
};
