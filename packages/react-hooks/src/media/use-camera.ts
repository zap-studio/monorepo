import { type UserMediaResult, useMediaStream } from "./_user-media.ts";

/** Options accepted by `useCamera`. */
interface UseCameraOptions {
  audio?: boolean;
  video?: boolean | MediaTrackConstraints;
}

/** The shape returned by `useCamera`. */
type UseCameraResult = UserMediaResult;

/**
 * A shortcut version of `useUserMedia` for the common case: just turn on
 * the webcam. Defaults to `{ video: true, audio: false }`. You still call
 * `start()` and `stop()` yourself, just like with `useUserMedia`.
 *
 * @example
 * ```tsx
 * const { stream, start } = useCamera({ audio: true });
 * <button onClick={start}>Enable camera + mic</button>
 * ```
 */
const useCamera = (options: UseCameraOptions = {}): UseCameraResult =>
  useMediaStream({ audio: options.audio ?? false, video: options.video ?? true });

export { useCamera };
export type { UseCameraOptions, UseCameraResult };
