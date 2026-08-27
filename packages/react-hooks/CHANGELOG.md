# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0]

### Added

- **State** (`state/`) — `useCredential`, wrapping the Credential Management API (`navigator.credentials`) for programmatic sign-in/sign-out.
- **Media** (`media/`) — `useExperimentalBarcodeDetector` (Barcode Detection API), `useExperimentalSelectAudioOutput` (audio output device selection).
- **DOM / element interaction** (`dom/`) — `useExperimentalContactPicker` (Contact Picker API).
- **Sensors** (`sensors/`) — `useExperimentalIdleDetector` (Idle Detection API), `useExperimentalLocalFonts` (Local Font Access API), and the Generic Sensor API family: `useExperimentalAccelerometer`, `useExperimentalLinearAccelerationSensor`, `useExperimentalGravitySensor`, `useExperimentalGyroscope`, `useExperimentalMagnetometer`, `useExperimentalAbsoluteOrientationSensor`, `useExperimentalRelativeOrientationSensor`, `useExperimentalAmbientLightSensor`.
- **Sensors** (`sensors/`) — `useExperimentalNfc`, wrapping the Web NFC API's `NDEFReader` for scanning, writing, and locking NDEF tags.
- **Sensors** (`sensors/`) — `useExperimentalWindowManagement`, wrapping the Window Management API (`window.getScreenDetails()`) for multi-screen layouts, plus a permission-free `isExtended` flag.
- **Network** (`network/`) — `useWebTransport`, wrapping the WebTransport API for HTTP/3 datagrams and reliable streams, alongside `useWebSocket`/`useEventSource`.
- **Lifecycle** (`lifecycle/`) — `useIsomorphicLayoutEffect`, `useLayoutEffect` on the client and `useEffect` on the server, so pre-paint effects don't warn during server rendering.
- **Debug** (`debug/`) — `useUnstableFiber` and `useUnstableRenderReason` accept an `options.maxWalk` to cap how many Fiber ancestors, hooks, or context entries they walk before giving up, for a component tree deeper than the default of 50.

### Fixed

- **Untyped `MessageEvent` casts** — `useEventSource` and `useWindowMessage` narrowed `event.data` with an `as` cast inside the handler body. Both now type the handler's `event` parameter as `MessageEvent<string>`/`MessageEvent<T>` instead, so `event.data` is already the right type at the point of use.
- **Ref targets are re-read on every commit** — `useIntersectionObserver`, `useResizeObserver`, `useHover`, `useFileDrop`, `useMutationObserver`, `usePopover`, and `usePictureInPicture` captured `ref.current` once, at mount. An element rendered conditionally, mounted later, or swapped for another one was silently never observed, and setting the ref back to `null` never detached.
- **Unattached refs no longer match `null`** — `useFullscreen` and `usePointerLock` compared `document.fullscreenElement`/`pointerLockElement` against a `ref.current` that could itself be `null`, reporting `true` whenever any _other_ element exited. `usePictureInPicture`'s `exit()` had the mirror bug and called `exitPictureInPicture()` on an unattached ref.
- **Options objects are compared by value, not identity** — `usePerformanceObserver` rebuilt its observer on every render for an inline `options` literal, re-delivering the whole entry buffer under `buffered: true`; `useIdleCallback` cancelled and re-requested every render, which can starve a callback that only ever fires once. `useIntersectionObserver`, `useMutationObserver`, `useKeyPress`, `useMediaRecorder`, `useScreenCapture`, `useUserMedia`, `useCamera`, `useWebLock`, `useExperimentalBarcodeDetector`, and `useLocalStorage`/`useSessionStorage` no longer churn their subscription or their returned callbacks for an unmemoized argument.
- **Debug hooks** — `useUnstableFiber` resolved its element during render, so `fiber` stayed `null` after mount until an unrelated re-render happened; `useIsFirstRender` flipped its ref during render, so StrictMode's discarded first pass consumed the `true` and the committed render returned `false`.
- **Stale "latest value" refs in fast-firing listeners** — `useNavigationBlocker`, `usePageLeave`, `useWindowMessage`, `useThrottle`, and `useLocalStorage`/`useSessionStorage` synced their "always use the latest callback/value" ref in a passive effect. A native event that can fire independently of this component's own render cycle — a `navigate`/`mouseout`/`message`/`storage` event, or the function `useThrottle` returns being called directly — could land in the gap before that effect flushed and read the previous render's value. They now sync in a layout effect, closing that window.
- **Unmemoized result objects** — `useGenericSensor` (the shared base for the `useExperimental*Sensor` family), `useDeviceMotion`, `useDeviceOrientation`, `useExperimentalIdleDetector`, `useExperimentalLocalFonts`, `useExperimentalContactPicker`, `useExperimentalEyeDropper`, `useFilePicker`, and `useViewTransition` returned a fresh object literal on every render even though every field inside was already a stable `useCallback` or a primitive. A consumer keeping the whole result — a non-destructured `useEffect`/`useMemo` dependency, a `React.memo`'d child prop, a context value — re-ran or re-rendered on every unrelated parent render. All nine now wrap their return value in `useMemo`.

### Changed

- **DOM / element interaction** (`dom/`) — `useClickOutside`, `useHotkeys`, `useHover`, `useFileDrop`, `usePointer`, and `useLockBodyScroll` now attach in a layout effect rather than a passive one, so an event fired between paint and the passive effect flush can no longer be missed — a swallowed outside click, a `keydown` that loses its `preventDefault()`, a latched `mouseleave`/`pointerup`, a one-shot `drop`, or a frame of scrollable background behind a modal.
- **DOM / element interaction** (`dom/`) — `useEventListener` now attaches in a layout effect rather than a passive one, so an event fired between paint and the passive effect flush can no longer be missed. Its `options` argument is compared field by field instead of by identity, so an inline object literal no longer re-subscribes on every render, and a `RefObject` target's `current` is re-read on every commit, so a ref that is `null` on the first render — or that later points at a different element — is picked up.
- **Debug** (`debug/`) — Renamed `useUnstableRenderCount` → `useRenderCount`, `useUnstableWhyDidYouUpdate` → `useWhyDidYouUpdate`, `useUnstableIsFirstRender` → `useIsFirstRender`, `useUnstableRenderDuration` → `useRenderDuration` (`UseUnstableRenderDurationResult` → `UseRenderDurationResult`), and `useUnstableOwnerStack` → `useOwnerStack` (`UseUnstableOwnerStackResult` → `UseOwnerStackResult`). None of these read react-dom's private Fiber internals — only `useUnstableFiber` and `useUnstableRenderReason` do, so only those two keep the `Unstable` marker. **Breaking rename.**
- **DOM / element interaction** (`dom/`) and **Sensors** (`sensors/`) — Renamed `useEyeDropper` → `useExperimentalEyeDropper`, `useUserAgentData` → `useExperimentalUserAgentData`, and `useVirtualKeyboard` → `useExperimentalVirtualKeyboard` (`UseEyeDropperResult` → `UseExperimentalEyeDropperResult`). MDN badges the EyeDropper API, the User-Agent Client Hints API, and the VirtualKeyboard API "Experimental," so these now match every other `useExperimental*` hook in the package. **Breaking rename.**
- **Docs** — Clarified what `Unstable` and `Experimental` mean in the README and the docs site: `Unstable` warns that this package could break on a React upgrade (private Fiber internals); `Experimental` warns that the wrapped browser API itself can change or ship in fewer browsers. Also simplified inline TSDoc comments across the package — the wording editors show on hover — and removed internal asides (cross-package references, a repeated "not a public hook" note) that had leaked into them.
- **Input** (`input/`) — `useGamepad` returns [`Gamepad`](https://developer.mozilla.org/en-US/docs/Web/API/Gamepad) objects instead of the truncated `GamepadInfo` (`id`/`index`/`mapping` only), exposing `axes`, `buttons`, `connected`, `timestamp`, and `hapticActuators`/`vibrationActuator` directly. `GamepadInfo` is removed. **Breaking change.**

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
