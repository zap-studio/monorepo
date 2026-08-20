import { type UserMediaResult, useMediaStream } from "./_user-media.ts";

/** Options accepted by `useCamera`. */
export interface UseCameraOptions {
  audio?: boolean;
  video?: boolean | MediaTrackConstraints;
}

/** The shape returned by `useCamera`. */
export type UseCameraResult = UserMediaResult;

/**
 * `useUserMedia` convenience wrapper for the common "just give me the
 * webcam" case — defaults to `{ video: true, audio: false }`. Manual
 * `start()`/`stop()`, same as `useUserMedia`.
 *
 * @example
 * ```tsx
 * const { stream, start } = useCamera({ audio: true });
 * <button onClick={start}>Enable camera + mic</button>
 * ```
 */
export const useCamera = (options: UseCameraOptions = {}): UseCameraResult =>
  useMediaStream({ audio: options.audio ?? false, video: options.video ?? true });
