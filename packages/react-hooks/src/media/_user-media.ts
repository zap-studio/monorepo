import { useCallback, useEffect, useRef, useState } from "react";

/** Status reported by `useUserMedia`/`useCamera`. */
export type MediaStreamStatus = "active" | "error" | "idle" | "requesting";

/** The shape returned by `useUserMedia`/`useCamera`. */
export interface UserMediaResult {
  error: Error | undefined;
  start: () => Promise<void>;
  status: MediaStreamStatus;
  stop: () => void;
  stream: MediaStream | undefined;
}

const isSupported = (): boolean =>
  typeof navigator !== "undefined" && typeof navigator.mediaDevices?.getUserMedia === "function";

/**
 * Shared `getUserMedia` request/teardown behind `useUserMedia` and
 * `useCamera`. Not itself a public hook — hook files never import one
 * another, so shared logic lives here (mirrors `@zap-studio/retry`'s
 * `_otel.ts` convention).
 */
export const useMediaStream = (constraints: MediaStreamConstraints): UserMediaResult => {
  const [stream, setStream] = useState<MediaStream | undefined>(undefined);
  const [status, setStatus] = useState<MediaStreamStatus>("idle");
  const [error, setError] = useState<Error | undefined>(undefined);
  const streamRef = useRef<MediaStream | null>(null);

  const constraintsRef = useRef(constraints);
  useEffect(() => {
    constraintsRef.current = constraints;
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
      setError(new Error("getUserMedia is not supported by this browser."));
      setStatus("error");
      return;
    }
    setStatus("requesting");
    setError(undefined);
    try {
      const media = await navigator.mediaDevices.getUserMedia(constraintsRef.current);
      streamRef.current = media;
      setStream(media);
      setStatus("active");
    } catch (caught) {
      setError(caught instanceof Error ? caught : new Error(String(caught)));
      setStatus("error");
    }
  }, []);

  useEffect(() => stop, [stop]);

  return { error, start, status, stop, stream };
};
