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

/** Config accepted by the shared `useMediaCapture` implementation. */
export interface UseMediaCaptureOptions<Args> {
  /** Latest arguments passed to `capture`; read fresh on every `start()` call. */
  args: Args;
  /** Requests the `MediaStream`, e.g. `getUserMedia`/`getDisplayMedia`. */
  capture: (args: Args) => Promise<MediaStream>;
  /**
   * Runs once a capture succeeds, e.g. to auto-stop on a native "inactive"
   * event. Return a cleanup to undo it (e.g. remove the listener); it runs
   * on every `stop()` — manual, unmount, or the event calling `stop` itself.
   */
  onStarted?: (media: MediaStream, stop: () => void) => (() => void) | void;
  /** Reports whether the underlying browser API exists. */
  supported: () => boolean;
  /** Error message used when `supported()` is `false`. */
  unsupportedMessage: string;
}

/**
 * Shared start/stop/status lifecycle for a `MediaStream`-producing browser
 * API. Backs `useMediaStream` (`getUserMedia`) and `useScreenCapture`
 * (`getDisplayMedia`) — they only differ in how the stream is requested.
 */
export const useMediaCapture = <Args>({
  args,
  capture,
  onStarted,
  supported,
  unsupportedMessage,
}: UseMediaCaptureOptions<Args>): UserMediaResult => {
  const [stream, setStream] = useState<MediaStream | undefined>(undefined);
  const [status, setStatus] = useState<MediaStreamStatus>("idle");
  const [error, setError] = useState<Error | undefined>(undefined);
  const streamRef = useRef<MediaStream | null>(null);
  const startedCleanupRef = useRef<(() => void) | null>(null);

  const optionsRef = useRef({ args, capture, onStarted, supported, unsupportedMessage });
  useEffect(() => {
    optionsRef.current = { args, capture, onStarted, supported, unsupportedMessage };
  });

  const isMountedRef = useRef(true);

  const stop = useCallback((): void => {
    startedCleanupRef.current?.();
    startedCleanupRef.current = null;
    for (const track of streamRef.current?.getTracks() ?? []) {
      track.stop();
    }
    streamRef.current = null;
    setStream(undefined);
    setStatus("idle");
  }, []);

  const start = useCallback(async (): Promise<void> => {
    const current = optionsRef.current;
    if (!current.supported()) {
      setError(new Error(current.unsupportedMessage));
      setStatus("error");
      return;
    }
    setStatus("requesting");
    setError(undefined);
    try {
      const media = await current.capture(current.args);
      if (!isMountedRef.current) {
        for (const track of media.getTracks()) {
          track.stop();
        }
        return;
      }
      streamRef.current = media;
      setStream(media);
      setStatus("active");
      startedCleanupRef.current = current.onStarted?.(media, stop) ?? null;
    } catch (caught) {
      setError(caught instanceof Error ? caught : new Error(String(caught)));
      setStatus("error");
    }
  }, [stop]);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      stop();
    };
  }, [stop]);

  return { error, start, status, stop, stream };
};

/**
 * Handles starting and stopping `getUserMedia` for both `useUserMedia`
 * and `useCamera`.
 */
export const useMediaStream = (constraints: MediaStreamConstraints): UserMediaResult =>
  useMediaCapture({
    args: constraints,
    capture: (currentConstraints) => navigator.mediaDevices.getUserMedia(currentConstraints),
    supported: isSupported,
    unsupportedMessage: "getUserMedia is not supported by this browser.",
  });
