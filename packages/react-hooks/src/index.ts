/**
 * Public entrypoint for the react-hooks package.
 *
 * Re-exports every stable hook. Each hook is also available from its own
 * category subpath (`@zap-studio/react-hooks/sensors/use-is-mobile`, ...)
 * for consumers who prefer granular imports. All exports are side-effect
 * free and tree-shakeable.
 *
 * Unstable hooks (relying on private/non-semver-guaranteed APIs) are never
 * re-exported here — see `@zap-studio/react-hooks/unstable`.
 *
 * @module @zap-studio/react-hooks
 */

export { useAnimationFrame } from "./lifecycle/use-animation-frame.ts";
export type { UseAppBadgeResult } from "./pwa/use-app-badge.ts";
export { useAppBadge } from "./pwa/use-app-badge.ts";
export type { UseAsyncState } from "./lifecycle/use-async.ts";
export { useAsync } from "./lifecycle/use-async.ts";
export type { BatteryState } from "./sensors/use-battery.ts";
export { useBattery } from "./sensors/use-battery.ts";
export { useBeforeUnload } from "./lifecycle/use-before-unload.ts";
export type { UseCameraOptions, UseCameraResult } from "./media/use-camera.ts";
export { useCamera } from "./media/use-camera.ts";
export type { ColorScheme } from "./sensors/use-color-scheme.ts";
export { useColorScheme } from "./sensors/use-color-scheme.ts";
export { useCookieEnabled } from "./sensors/use-cookie-enabled.ts";
export type { UseCopyToClipboardResult } from "./state/use-copy-to-clipboard.ts";
export { useCopyToClipboard } from "./state/use-copy-to-clipboard.ts";
export type { UseCounterOptions, UseCounterResult } from "./state/use-counter.ts";
export { useCounter } from "./state/use-counter.ts";
export { useDebounce } from "./state/use-debounce.ts";
export { useDebouncedValue } from "./state/use-debounced-value.ts";
export type { DeviceCapabilities } from "./sensors/use-device-capabilities.ts";
export { useDeviceCapabilities } from "./sensors/use-device-capabilities.ts";
export type { DeviceMotionState, UseDeviceMotionResult } from "./sensors/use-device-motion.ts";
export { useDeviceMotion } from "./sensors/use-device-motion.ts";
export type {
  DeviceOrientationState,
  UseDeviceOrientationResult,
} from "./sensors/use-device-orientation.ts";
export { useDeviceOrientation } from "./sensors/use-device-orientation.ts";
export { useDevicePixelRatio } from "./sensors/use-device-pixel-ratio.ts";
export { useDocumentVisibility } from "./sensors/use-document-visibility.ts";
export type { EventSourceStatus, UseEventSourceResult } from "./network/use-event-source.ts";
export { useEventSource } from "./network/use-event-source.ts";
export { useFontsReady } from "./sensors/use-fonts-ready.ts";
export type { GamepadInfo } from "./input/use-gamepad.ts";
export { useGamepad } from "./input/use-gamepad.ts";
export type {
  GeolocationCoordinatesState,
  GeolocationErrorState,
  GeolocationState,
  UseGeolocationOptions,
} from "./sensors/use-geolocation.ts";
export { useGeolocation } from "./sensors/use-geolocation.ts";
export type { HotkeyBindings, UseHotkeysOptions } from "./input/use-hotkeys.ts";
export { useHotkeys } from "./input/use-hotkeys.ts";
export { useIdle } from "./input/use-idle.ts";
export { useIdleCallback } from "./lifecycle/use-idle-callback.ts";
export type { IndexedDBStatus, UseIndexedDBResult } from "./state/use-indexed-db.ts";
export { useIndexedDB } from "./state/use-indexed-db.ts";
export type { UseInstallPromptResult } from "./pwa/use-install-prompt.ts";
export { useInstallPrompt } from "./pwa/use-install-prompt.ts";
export { useInterval } from "./lifecycle/use-interval.ts";
export { useIsClient } from "./sensors/use-is-client.ts";
export { useIsMobile } from "./sensors/use-is-mobile.ts";
export { useIsServer } from "./sensors/use-is-server.ts";
export { useKeyPress } from "./input/use-key-press.ts";
export type { SetStoredValue, UseLocalStorageResult } from "./state/use-local-storage.ts";
export { useLocalStorage } from "./state/use-local-storage.ts";
export { useMediaQuery } from "./sensors/use-media-query.ts";
export type { MediaRecorderStatus, UseMediaRecorderResult } from "./media/use-media-recorder.ts";
export { useMediaRecorder } from "./media/use-media-recorder.ts";
export { useMount } from "./lifecycle/use-mount.ts";
export type { NetworkState } from "./sensors/use-network-state.ts";
export { useNetworkState } from "./sensors/use-network-state.ts";
export type { UseNotificationPermissionResult } from "./sensors/use-notification-permission.ts";
export { useNotificationPermission } from "./sensors/use-notification-permission.ts";
export { useOnlineStatus } from "./sensors/use-online-status.ts";
export type { Orientation } from "./sensors/use-orientation.ts";
export { useOrientation } from "./sensors/use-orientation.ts";
export { usePageLeave } from "./sensors/use-page-leave.ts";
export type {
  PaymentRequestStatus,
  UsePaymentRequestResult,
} from "./commerce/use-payment-request.ts";
export { usePaymentRequest } from "./commerce/use-payment-request.ts";
export type { UsePerformanceObserverResult } from "./lifecycle/use-performance-observer.ts";
export { usePerformanceObserver } from "./lifecycle/use-performance-observer.ts";
export { usePermission } from "./sensors/use-permission.ts";
export type { UsePictureInPictureResult } from "./media/use-picture-in-picture.ts";
export { usePictureInPicture } from "./media/use-picture-in-picture.ts";
export type { UsePointerLockResult } from "./input/use-pointer-lock.ts";
export { usePointerLock } from "./input/use-pointer-lock.ts";
export { usePrefersDarkMode } from "./sensors/use-prefers-dark-mode.ts";
export type { PreferredLanguage } from "./sensors/use-preferred-language.ts";
export { usePreferredLanguage } from "./sensors/use-preferred-language.ts";
export { usePrevious } from "./state/use-previous.ts";
export { usePrintMode } from "./sensors/use-print-mode.ts";
export type { UseServiceWorkerResult } from "./pwa/use-service-worker.ts";
export type { ScreenCaptureStatus, UseScreenCaptureResult } from "./media/use-screen-capture.ts";
export { useScreenCapture } from "./media/use-screen-capture.ts";
export { useServiceWorker } from "./pwa/use-service-worker.ts";
export type { UseSessionStorageResult } from "./state/use-session-storage.ts";
export { useSessionStorage } from "./state/use-session-storage.ts";
export type { UseShareResult } from "./sensors/use-share.ts";
export { useShare } from "./sensors/use-share.ts";
export type { StorageEstimateState } from "./sensors/use-storage-estimate.ts";
export type {
  UseSpeechRecognitionOptions,
  UseSpeechRecognitionResult,
} from "./media/use-speech-recognition.ts";
export { useSpeechRecognition } from "./media/use-speech-recognition.ts";
export type { SpeakOptions, UseSpeechSynthesisResult } from "./media/use-speech-synthesis.ts";
export { useSpeechSynthesis } from "./media/use-speech-synthesis.ts";
export { useStorageEstimate } from "./sensors/use-storage-estimate.ts";
export type { ResolvedTheme, ThemeMode, UseThemeResult } from "./state/use-theme.ts";
export { useTheme } from "./state/use-theme.ts";
export { useThrottle } from "./state/use-throttle.ts";
export { useThrottledValue } from "./state/use-throttled-value.ts";
export { useTimeout } from "./lifecycle/use-timeout.ts";
export type { UseToggleResult } from "./state/use-toggle.ts";
export { useToggle } from "./state/use-toggle.ts";
export { useTouchSupport } from "./sensors/use-touch-support.ts";
export { useUnmount } from "./lifecycle/use-unmount.ts";
export { useUpdateEffect } from "./lifecycle/use-update-effect.ts";
export type { UserActivationState } from "./input/use-user-activation.ts";
export { useUserActivation } from "./input/use-user-activation.ts";
export type { UserAgentData, UserAgentDataBrand } from "./sensors/use-user-agent-data.ts";
export { useUserAgentData } from "./sensors/use-user-agent-data.ts";
export type { UseVibrateResult } from "./sensors/use-vibrate.ts";
export type { MediaStreamStatus, UseUserMediaResult } from "./media/use-user-media.ts";
export { useUserMedia } from "./media/use-user-media.ts";
export { useVibrate } from "./sensors/use-vibrate.ts";
export type { VirtualKeyboardRect } from "./sensors/use-virtual-keyboard.ts";
export { useVirtualKeyboard } from "./sensors/use-virtual-keyboard.ts";
export type { VisualViewportState } from "./sensors/use-visual-viewport.ts";
export { useVisualViewport } from "./sensors/use-visual-viewport.ts";
export type { UseWakeLockResult } from "./sensors/use-wake-lock.ts";
export { useWakeLock } from "./sensors/use-wake-lock.ts";
export type { UseWebLockResult, WebLockStatus } from "./lifecycle/use-web-lock.ts";
export { useWebLock } from "./lifecycle/use-web-lock.ts";
export type { UseWebSocketResult, WebSocketStatus } from "./network/use-web-socket.ts";
export { useWebSocket } from "./network/use-web-socket.ts";
export type { WindowSize } from "./sensors/use-window-size.ts";
export { useWindowSize } from "./sensors/use-window-size.ts";
export type { UseWorkerResult } from "./lifecycle/use-worker.ts";
export { useWorker } from "./lifecycle/use-worker.ts";
