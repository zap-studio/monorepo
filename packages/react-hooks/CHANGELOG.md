# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0]

### Added

- **State** (`state/`) — `useCredential`, wrapping the Credential Management API (`navigator.credentials`) for programmatic sign-in/sign-out.
- **Media** (`media/`) — `useExperimentalBarcodeDetector` (Barcode Detection API), `useExperimentalSelectAudioOutput` (audio output device selection).
- **DOM / element interaction** (`dom/`) — `useExperimentalContactPicker` (Contact Picker API).
- **Sensors** (`sensors/`) — `useExperimentalIdleDetector` (Idle Detection API), `useExperimentalLocalFonts` (Local Font Access API), and the Generic Sensor API family: `useExperimentalAccelerometer`, `useExperimentalLinearAccelerationSensor`, `useExperimentalGravitySensor`, `useExperimentalGyroscope`, `useExperimentalMagnetometer`, `useExperimentalAbsoluteOrientationSensor`, `useExperimentalRelativeOrientationSensor`, `useExperimentalAmbientLightSensor`.

## [1.0.0]

### Added

Initial public release of `@zap-studio/react-hooks` — 100+ small, focused hooks, each shipping as its own subpath export with SSR-safe defaults and 100% test coverage.

- **Sensors** (`sensors/`) — `useMediaQuery`, `useIsMobile`, `useIsClient`, `useIsServer`, `useColorScheme`, `usePrefersDarkMode`, `useOnlineStatus`, `useNetworkState`, `usePreferredLanguage`, `useOrientation`, `useGeolocation`, `useBattery`, `useWindowSize`, `useDocumentVisibility`, `usePageLeave`, `useShare`, `usePermission`, `useVibrate`, `useWakeLock`, `useStorageEstimate`, `useDeviceCapabilities`, `useDeviceOrientation`, `useDeviceMotion`, `useVisualViewport`, `useDevicePixelRatio`, `useTouchSupport`, `useUserAgentData`, `useCookieEnabled`, `useVirtualKeyboard`, `usePrintMode`, `useNotificationPermission`, `useFontsReady`.
- **DOM / element interaction** (`dom/`) — `useClickOutside`, `useHover`, `useMousePosition`, `useIntersectionObserver` (alias `useInView`), `useResizeObserver`, `useEventListener`, `useLockBodyScroll`, `useFavicon`, `useScript`, `useScrollPosition`, `useTextSelection`, `useFilePicker`, `useFileDrop` (alias `useDropzone`), `useMutationObserver`, `useFullscreen`, `usePointer`, `usePopover`, `useViewTransition`, `useEyeDropper`.
- **Input** (`input/`) — `useKeyPress`, `useHotkeys`, `useIdle`, `useGamepad`, `useUserActivation`, `usePointerLock`.
- **Media** (`media/`) — `useUserMedia`, `useCamera`, `useScreenCapture`, `useMediaRecorder`, `useSpeechSynthesis`, `useSpeechRecognition`, `usePictureInPicture`.
- **History & Navigation** (`navigation/`) — `usePopState`, `useNavigationType`, `useNavigation`, `useNavigationBlocker`.
- **Network** (`network/`) — `useWebSocket`, `useEventSource`.
- **PWA** (`pwa/`) — `useInstallPrompt`, `useServiceWorker`, `useAppBadge`, `useStandaloneMode`.
- **Commerce** (`commerce/`) — `usePaymentRequest`.
- **Lifecycle** (`lifecycle/`) — `useMount`, `useUnmount`, `useUpdateEffect`, `useTimeout`, `useInterval`, `useAsync`, `useBeforeUnload`, `useAnimationFrame`, `useIdleCallback`, `useWebLock`, `useWorker`, `usePerformanceObserver`.
- **State** (`state/`) — `useToggle`, `useDebounce`, `useDebouncedValue`, `useThrottle`, `useThrottledValue`, `useLocalStorage`, `useSessionStorage`, `useIndexedDB`, `usePrevious`, `useCopyToClipboard`, `useCounter`, `useTheme`, `useMap`, `useSet`, `useQueue`, `useHistoryState`, `useSearchParams`, `useHashState`, `useCookie`, `useBroadcastChannel`, `useWindowMessage`.
- **Debug / observability** (`debug/`) — `useUnstableRenderCount`, `useUnstableWhyDidYouUpdate`, `useUnstableIsFirstRender`, `useUnstableRenderReason`, `useUnstableFiber`, `useUnstableRenderDuration`, `useUnstableOwnerStack`. These wrap private, non-semver-guaranteed React/react-dom internals — the risk is signaled by the `Unstable` marker in the hook's own name rather than a separate module.
