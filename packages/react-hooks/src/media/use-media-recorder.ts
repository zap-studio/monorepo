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
  const [recorder, setRecorder] = useState<MediaRecorder | null>(null);
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

    const newRecorder = new MediaRecorder(stream, optionsRef.current);
    newRecorder.start();
    recorderRef.current = newRecorder;
    setRecorder(newRecorder);
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

  useEffect(() => {
    if (!recorder) {
      return undefined;
    }
    const handleDataAvailable = (event: BlobEvent) => {
      if (event.data.size > 0) {
        chunksRef.current.push(event.data);
      }
    };
    const handleStop = () => {
      setBlob(new Blob(chunksRef.current, { type: recorder.mimeType }));
      setStatus("inactive");
    };
    const handleError = () => {
      setError(new Error("MediaRecorder encountered an error."));
      setStatus("inactive");
    };

    recorder.addEventListener("dataavailable", handleDataAvailable);
    recorder.addEventListener("stop", handleStop);
    recorder.addEventListener("error", handleError);
    return () => {
      recorder.removeEventListener("dataavailable", handleDataAvailable);
      recorder.removeEventListener("stop", handleStop);
      recorder.removeEventListener("error", handleError);
    };
  }, [recorder]);

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
