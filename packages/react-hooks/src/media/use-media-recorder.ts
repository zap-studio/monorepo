import { useCallback, useEffect, useRef, useState } from "react";

/** Status reported by `useMediaRecorder`. */
export type MediaRecorderStatus = "inactive" | "paused" | "recording";

/** The shape returned by `useMediaRecorder`. */
export interface UseMediaRecorderResult {
  blob: Blob | undefined;
  error: Error | undefined;
  pause: () => void;
  resume: () => void;
  start: () => void;
  status: MediaRecorderStatus;
  stop: () => void;
  supported: boolean;
}

const isSupported = (): boolean => typeof MediaRecorder !== "undefined";

/**
 * Wraps the MediaStream Recording API around an existing `stream` — e.g.
 * one from `useUserMedia`/`useCamera`/`useScreenCapture`. Manual
 * `start()`/`stop()`/`pause()`/`resume()`; `blob` is assembled once
 * recording stops. `supported: false` — the SSR-safe default — where
 * `MediaRecorder` doesn't exist.
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

  const start = useCallback((): void => {
    if (!isSupported() || !stream) {
      return;
    }
    setError(undefined);
    setBlob(undefined);
    chunksRef.current = [];

    const recorder = new MediaRecorder(stream, options);
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
  }, [stream, options]);

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

  return { blob, error, pause, resume, start, status, stop, supported };
};
