import { type UserMediaResult, useMediaCapture } from "./_user-media.ts";

/** Status reported by `useScreenCapture`. */
export type ScreenCaptureStatus = UserMediaResult["status"];

/** The shape returned by `useScreenCapture`. */
export type UseScreenCaptureResult = UserMediaResult;

const isSupported = (): boolean =>
  typeof navigator !== "undefined" && typeof navigator.mediaDevices?.getDisplayMedia === "function";

/**
 * Wraps `navigator.mediaDevices.getDisplayMedia()` for sharing a screen,
 * window, or tab. You must call `start()` yourself from a user action,
 * like a click, since browsers require a real user gesture and this hook
 * never fakes one. The `stream` also stops itself automatically if the
 * user clicks the browser's own "Stop sharing" button, so `status` always
 * matches reality.
 *
 * @example
 * ```tsx
 * const { stream, status, start, stop } = useScreenCapture({ video: true });
 * <button onClick={start}>Share screen</button>
 * ```
 */
export const useScreenCapture = (options?: DisplayMediaStreamOptions): UseScreenCaptureResult =>
  useMediaCapture({
    args: options,
    capture: (currentOptions) => navigator.mediaDevices.getDisplayMedia(currentOptions),
    onStarted: (media, stop) => {
      // oxlint-disable-next-line react-doctor/effect-needs-cleanup -- the returned cleanup below IS invoked, by useMediaCapture's stop() (see _user-media.ts); the rule can't trace that indirection.
      media.addEventListener("inactive", stop);
      return () => media.removeEventListener("inactive", stop);
    },
    supported: isSupported,
    unsupportedMessage: "getDisplayMedia is not supported by this browser.",
  });
