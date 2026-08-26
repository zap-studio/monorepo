import { type MediaStreamStatus, type UserMediaResult, useMediaStream } from "./_user-media.ts";

export type { MediaStreamStatus };

/** The shape returned by `useUserMedia`. */
export type UseUserMediaResult = UserMediaResult;

/**
 * Wraps `navigator.mediaDevices.getUserMedia()` for any audio/video
 * constraints you need. You call `start()` and `stop()` yourself. It
 * never asks for permission automatically, since a camera or microphone
 * prompt on mount, without a user action, is bad UX (some browsers even
 * block it). The `stream` stops itself automatically when the component
 * unmounts. For the common "just turn on the webcam" case, see
 * `useCamera`.
 *
 * @example
 * ```tsx
 * const { stream, status, start, stop } = useUserMedia({ video: true, audio: true });
 * <button onClick={start}>Enable camera</button>
 * ```
 */
export const useUserMedia = (constraints: MediaStreamConstraints): UseUserMediaResult =>
  useMediaStream(constraints);
