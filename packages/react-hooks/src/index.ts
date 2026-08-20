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

export type { UseAppBadgeResult } from "./pwa/use-app-badge.ts";
export { useAppBadge } from "./pwa/use-app-badge.ts";
export type { BatteryState } from "./sensors/use-battery.ts";
export { useBattery } from "./sensors/use-battery.ts";
export type { ColorScheme } from "./sensors/use-color-scheme.ts";
export { useColorScheme } from "./sensors/use-color-scheme.ts";
export { useCookieEnabled } from "./sensors/use-cookie-enabled.ts";
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
export type { UseInstallPromptResult } from "./pwa/use-install-prompt.ts";
export { useInstallPrompt } from "./pwa/use-install-prompt.ts";
export { useIsClient } from "./sensors/use-is-client.ts";
export { useIsMobile } from "./sensors/use-is-mobile.ts";
export { useIsServer } from "./sensors/use-is-server.ts";
export { useKeyPress } from "./input/use-key-press.ts";
export { useMediaQuery } from "./sensors/use-media-query.ts";
export type { NetworkState } from "./sensors/use-network-state.ts";
export { useNetworkState } from "./sensors/use-network-state.ts";
export type { UseNotificationPermissionResult } from "./sensors/use-notification-permission.ts";
export { useNotificationPermission } from "./sensors/use-notification-permission.ts";
export { useOnlineStatus } from "./sensors/use-online-status.ts";
export type { Orientation } from "./sensors/use-orientation.ts";
export { useOrientation } from "./sensors/use-orientation.ts";
export { usePageLeave } from "./sensors/use-page-leave.ts";
export { usePermission } from "./sensors/use-permission.ts";
export type { UsePointerLockResult } from "./input/use-pointer-lock.ts";
export { usePointerLock } from "./input/use-pointer-lock.ts";
export { usePrefersDarkMode } from "./sensors/use-prefers-dark-mode.ts";
export type { PreferredLanguage } from "./sensors/use-preferred-language.ts";
export { usePreferredLanguage } from "./sensors/use-preferred-language.ts";
export { usePrintMode } from "./sensors/use-print-mode.ts";
export type { UseServiceWorkerResult } from "./pwa/use-service-worker.ts";
export { useServiceWorker } from "./pwa/use-service-worker.ts";
export type { UseShareResult } from "./sensors/use-share.ts";
export { useShare } from "./sensors/use-share.ts";
export type { StorageEstimateState } from "./sensors/use-storage-estimate.ts";
export { useStorageEstimate } from "./sensors/use-storage-estimate.ts";
export { useTouchSupport } from "./sensors/use-touch-support.ts";
export type { UserActivationState } from "./input/use-user-activation.ts";
export { useUserActivation } from "./input/use-user-activation.ts";
export type { UserAgentData, UserAgentDataBrand } from "./sensors/use-user-agent-data.ts";
export { useUserAgentData } from "./sensors/use-user-agent-data.ts";
export type { UseVibrateResult } from "./sensors/use-vibrate.ts";
export { useVibrate } from "./sensors/use-vibrate.ts";
export type { VirtualKeyboardRect } from "./sensors/use-virtual-keyboard.ts";
export { useVirtualKeyboard } from "./sensors/use-virtual-keyboard.ts";
export type { VisualViewportState } from "./sensors/use-visual-viewport.ts";
export { useVisualViewport } from "./sensors/use-visual-viewport.ts";
export type { UseWakeLockResult } from "./sensors/use-wake-lock.ts";
export { useWakeLock } from "./sensors/use-wake-lock.ts";
export type { UseWebSocketResult, WebSocketStatus } from "./network/use-web-socket.ts";
export { useWebSocket } from "./network/use-web-socket.ts";
export type { WindowSize } from "./sensors/use-window-size.ts";
export { useWindowSize } from "./sensors/use-window-size.ts";
