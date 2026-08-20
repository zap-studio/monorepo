import { type MediaStreamStatus, type UserMediaResult, useMediaStream } from "./_user-media.ts";

export type { MediaStreamStatus };

/** The shape returned by `useUserMedia`. */
export type UseUserMediaResult = UserMediaResult;

/**
 * Wraps `navigator.mediaDevices.getUserMedia()` for arbitrary audio/video
 * constraints. Manual `start()`/`stop()` — never requested automatically,
 * since a camera/mic prompt firing on mount without a user gesture is bad
 * UX (and some browsers reject it outright). `stream` is stopped
 * automatically on unmount. For the common "just give me the webcam" case,
 * see `useCamera`.
 *
 * @example
 * ```tsx
 * const { stream, status, start, stop } = useUserMedia({ video: true, audio: true });
 * <button onClick={start}>Enable camera</button>
 * ```
 */
export const useUserMedia = (constraints: MediaStreamConstraints): UseUserMediaResult =>
  useMediaStream(constraints);
