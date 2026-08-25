# @zap-studio/react-hooks

Small, focused React hooks. Each one ships as its own subpath export, so importing one never pulls in unrelated hooks.

Full documentation: [zapstudio.dev/react-hooks](https://www.zapstudio.dev/react-hooks)

## Motivation

Reaching a browser API from React usually means hand-writing a `useEffect` — a resize listener, a `matchMedia` subscription, an `IntersectionObserver` — and each one carries the same two risks: forget the cleanup and you get a leaked listener that keeps firing after unmount, or forget to guard `window`/`document`/`navigator` and the same code throws on the server or hydrates to a value the client's first render did not have.

`@zap-studio/react-hooks` wraps these APIs — `IntersectionObserver`, `ResizeObserver`, the Battery/Geolocation/Share/Wake Lock APIs, `matchMedia`, and more — behind a small, correct React interface instead of code you write from scratch. Every hook is SSR- and hydration-safe: nothing touches `window`, `document`, or `navigator` outside an effect or a guarded check, so server renders never throw and hydration never mismatches.

Every hook also ships as its own standalone, side-effect-free module — import it on its own and it tree-shakes cleanly. Public hooks never import each other; some share small internal (`_`-prefixed) helper modules, so pulling in `useIsMobile` never drags in unrelated hook code.

## Installation

```bash
npm install @zap-studio/react-hooks
```

## Quick Start

Import hooks from the top-level package, or from their own subpath if you want the narrowest possible import:

```tsx
import { useIsMobile, useMediaQuery } from "@zap-studio/react-hooks";
// or, equivalently:
// import { useIsMobile } from "@zap-studio/react-hooks/sensors/use-is-mobile";
// import { useMediaQuery } from "@zap-studio/react-hooks/sensors/use-media-query";

function Nav() {
  const isMobile = useIsMobile(); // true below 768px
  const prefersDark = useMediaQuery("(prefers-color-scheme: dark)");

  return isMobile ? <MobileNav dark={prefersDark} /> : <DesktopNav dark={prefersDark} />;
}
```

Both hooks are SSR-safe: they return `false` until the client subscribes to `matchMedia`, so server-rendered and first-client-render output match — no hydration warnings.

## Available Hooks

Every hook is also importable from its own category subpath — see [Conventions](#conventions).

### Sensors (`sensors/`)

| Hook                                       | What it does                                                                                                          |
| ------------------------------------------ | --------------------------------------------------------------------------------------------------------------------- |
| `useMediaQuery`                            | Matches the viewport against an arbitrary CSS media query string                                                      |
| `useIsMobile`                              | `true` below a breakpoint (768px by default) — built on `useMediaQuery`                                               |
| `useIsClient`                              | `true` only after the client has mounted — SSR hydration guard                                                        |
| `useIsServer`                              | `true` only during server rendering — the inverse of `useIsClient`                                                    |
| `useColorScheme`                           | `"dark"` or `"light"`, from `(prefers-color-scheme: dark)`                                                            |
| `usePrefersDarkMode`                       | Boolean shorthand for `useColorScheme() === "dark"`                                                                   |
| `useOnlineStatus`                          | Tracks `navigator.onLine`, updating on `online`/`offline` events                                                      |
| `useNetworkState`                          | `useOnlineStatus` plus `navigator.connection` info where supported                                                    |
| `usePreferredLanguage`                     | `navigator.language`/`navigator.languages`, updating on `languagechange`                                              |
| `useOrientation`                           | `screen.orientation`'s `angle`/`type`, updating on orientation change                                                 |
| `useGeolocation`                           | Wraps `navigator.geolocation`; one-shot by default, `watch: true` for continuous updates                              |
| `useBattery`                               | Wraps the Battery Status API (Chromium-only); `supported: false` elsewhere                                            |
| `useWindowSize`                            | `window.innerWidth`/`innerHeight`, updating on `resize`                                                               |
| `useDocumentVisibility`                    | `document.visibilityState`, updating on `visibilitychange`                                                            |
| `usePageLeave`                             | Calls a handler when the pointer leaves the viewport — exit-intent UI                                                 |
| `useShare`                                 | Wraps the Web Share API (`navigator.share`), with `canShare` feature-detection                                        |
| `usePermission`                            | `navigator.permissions.query({ name })`'s state for a given permission                                                |
| `useVibrate`                               | Wraps `navigator.vibrate()` — mostly Android Chrome; no-op elsewhere                                                  |
| `useWakeLock`                              | Screen Wake Lock; auto-released on tab hide/unmount                                                                   |
| `useStorageEstimate`                       | `navigator.storage.estimate()`'s `usage`/`quota`, one-shot on mount                                                   |
| `useDeviceCapabilities`                    | `navigator.hardwareConcurrency`/`deviceMemory` (latter Chromium-only)                                                 |
| `useDeviceOrientation`                     | Accelerometer/magnetometer tilt; iOS requires a `requestPermission()` gesture                                         |
| `useDeviceMotion`                          | Accelerometer motion; same iOS permission caveat as `useDeviceOrientation`                                            |
| `useVisualViewport`                        | `window.visualViewport`; captures on-screen-keyboard shrink `innerHeight` misses                                      |
| `useDevicePixelRatio`                      | `window.devicePixelRatio`, updating on zoom/monitor moves                                                             |
| `useTouchSupport`                          | `true` when `navigator.maxTouchPoints > 0`                                                                            |
| `useUserAgentData`                         | `navigator.userAgentData`'s low-entropy fields — structured `navigator.userAgent`                                     |
| `useCookieEnabled`                         | `navigator.cookieEnabled`                                                                                             |
| `useVirtualKeyboard`                       | `navigator.virtualKeyboard`'s bounding rect (Chromium-only)                                                           |
| `usePrintMode`                             | `true` while printing, via the `print` media query                                                                    |
| `useNotificationPermission`                | Notifications API permission state + a `notify()` trigger                                                             |
| `useFontsReady`                            | `true` once `document.fonts.ready` resolves — avoid FOUC on custom web fonts                                          |
| `useExperimentalIdleDetector`              | Idle Detection API — `userState`/`screenState` (Experimental, Chromium-only)                                          |
| `useExperimentalLocalFonts`                | Local Font Access API — `window.queryLocalFonts()` (Experimental, Chromium-only)                                      |
| `useExperimentalAccelerometer`             | Generic Sensor API `Accelerometer` — acceleration incl. gravity (Experimental, Chromium-only)                         |
| `useExperimentalLinearAccelerationSensor`  | Generic Sensor API `LinearAccelerationSensor` — acceleration excl. gravity (Experimental, Chromium-only)              |
| `useExperimentalGravitySensor`             | Generic Sensor API `GravitySensor` — gravity component of acceleration (Experimental, Chromium-only)                  |
| `useExperimentalGyroscope`                 | Generic Sensor API `Gyroscope` — angular velocity (Experimental, Chromium-only)                                       |
| `useExperimentalMagnetometer`              | Generic Sensor API `Magnetometer` — ambient magnetic field (Experimental, Chromium-only)                              |
| `useExperimentalAbsoluteOrientationSensor` | Generic Sensor API `AbsoluteOrientationSensor` — rotation quaternion, geomagnetic north (Experimental, Chromium-only) |
| `useExperimentalRelativeOrientationSensor` | Generic Sensor API `RelativeOrientationSensor` — rotation quaternion, no magnetometer (Experimental, Chromium-only)   |
| `useExperimentalAmbientLightSensor`        | Generic Sensor API `AmbientLightSensor` — ambient light in lux (Experimental, Chromium-only)                          |

### DOM / element interaction (`dom/`)

| Hook                           | What it does                                                                     |
| ------------------------------ | -------------------------------------------------------------------------------- |
| `useClickOutside`              | Detects a click/touch outside a ref'd element                                    |
| `useHover`                     | Boolean hover state for a ref'd element                                          |
| `useMousePosition`             | Pointer `clientX`/`clientY`/`pageX`/`pageY`/`screenX`/`screenY`, via `mousemove` |
| `useIntersectionObserver`      | Element visibility in the viewport (also exported as `useInView`)                |
| `useResizeObserver`            | Element content-box size tracking via `ResizeObserver`                           |
| `useEventListener`             | Typed, auto-cleanup `addEventListener` wrapper                                   |
| `useLockBodyScroll`            | Locks body scroll (modals/drawers)                                               |
| `useFavicon`                   | Imperatively swaps the `<link rel="icon">` href                                  |
| `useScript`                    | Loads an external `<script src>` on demand, dedupes concurrent requests          |
| `useScrollPosition`            | `window.scrollX`/`scrollY`, updating on the `scroll` event                       |
| `useTextSelection`             | The current page text selection, via `window.getSelection()`                     |
| `useFilePicker`                | File System Access API (Chromium-only)                                           |
| `useFileDrop`                  | Drag-and-drop file upload state (also exported as `useDropzone`)                 |
| `useMutationObserver`          | `MutationObserver` on a ref'd element/subtree                                    |
| `useFullscreen`                | Fullscreen API wrapper for a ref'd element                                       |
| `usePointer`                   | Unified mouse/touch/pen position via Pointer events                              |
| `usePopover`                   | Native Popover API open/close state                                              |
| `useViewTransition`            | `document.startViewTransition()` wrapper                                         |
| `useEyeDropper`                | EyeDropper API, single-shot color picker (Chromium-only)                         |
| `useExperimentalContactPicker` | Contact Picker API — `navigator.contacts.select()` (Experimental, Chromium-only) |

### Input (`input/`)

| Hook                | What it does                                                                   |
| ------------------- | ------------------------------------------------------------------------------ |
| `useKeyPress`       | `true` while any of the given key(s) is held down                              |
| `useHotkeys`        | Registers `"ctrl+s"`-style keyboard shortcut combos mapped to handlers         |
| `useIdle`           | `true` after a period of no mouse/keyboard/touch/scroll activity               |
| `useGamepad`        | Connected gamepads, via `navigator.getGamepads()` + connect/disconnect events  |
| `useUserActivation` | `navigator.userActivation`'s `isActive`/`hasBeenActive` — gate autoplay/popups |
| `usePointerLock`    | Pointer Lock API wrapper for a ref'd element (games, drag-to-look UIs)         |

### Media (`media/`)

| Hook                               | What it does                                                                     |
| ---------------------------------- | -------------------------------------------------------------------------------- |
| `useUserMedia`                     | Wraps `getUserMedia()` for arbitrary audio/video constraints                     |
| `useCamera`                        | `useUserMedia` convenience wrapper for the common webcam case                    |
| `useScreenCapture`                 | Wraps `getDisplayMedia()` — screen/window/tab sharing                            |
| `useMediaRecorder`                 | Wraps the MediaStream Recording API around an existing stream                    |
| `useSpeechSynthesis`               | Wraps the Web Speech API's synthesis half — text-to-speech                       |
| `useSpeechRecognition`             | Wraps the Web Speech API's recognition half — voice input (Chromium/Safari only) |
| `usePictureInPicture`              | Picture-in-Picture wrapper for a ref'd `<video>`                                 |
| `useExperimentalBarcodeDetector`   | Barcode Detection API — `BarcodeDetector.detect()` (Experimental, Chromium-only) |
| `useExperimentalSelectAudioOutput` | `MediaDevices.selectAudioOutput()` device picker (Experimental, Chromium-only)   |

### History & Navigation (`navigation/`)

| Hook                   | What it does                                                                    |
| ---------------------- | ------------------------------------------------------------------------------- |
| `usePopState`          | `popstate` event — `location.pathname`/`history.state` on back/forward          |
| `useNavigationType`    | Classifies the current entry: `navigate`/`reload`/`back_forward`/`prerender`    |
| `useNavigation`        | Wraps the Navigation API's `window.navigation` (Chromium-only)                  |
| `useNavigationBlocker` | Blocks/confirms in-app route transitions via the Navigation API (Chromium-only) |

### Network (`network/`)

| Hook             | What it does                                                             |
| ---------------- | ------------------------------------------------------------------------ |
| `useWebSocket`   | WebSocket connection state + `send()`/`close()`, latest message received |
| `useEventSource` | Server-Sent Events connection state + latest message data                |

### PWA (`pwa/`)

| Hook                | What it does                                                                   |
| ------------------- | ------------------------------------------------------------------------------ |
| `useInstallPrompt`  | Custom "Add to Home Screen" UI, wrapping `beforeinstallprompt`/`appinstalled`  |
| `useServiceWorker`  | Service Worker registration + update-available state                           |
| `useAppBadge`       | Wraps the Badging API (`navigator.setAppBadge`/`clearAppBadge`)                |
| `useStandaloneMode` | Whether the app is running standalone (installed as a PWA), via `display-mode` |

### Commerce (`commerce/`)

| Hook                | What it does                                                   |
| ------------------- | -------------------------------------------------------------- |
| `usePaymentRequest` | Wraps the Payment Request API — shows the native payment sheet |

### Lifecycle (`lifecycle/`)

| Hook                     | What it does                                                             |
| ------------------------ | ------------------------------------------------------------------------ |
| `useMount`               | Runs an effect exactly once, on mount                                    |
| `useUnmount`             | Runs a cleanup exactly once, on unmount                                  |
| `useUpdateEffect`        | `useEffect` that skips the first (mount) run                             |
| `useTimeout`             | Declarative `setTimeout` with cleanup                                    |
| `useInterval`            | Declarative `setInterval` with cleanup                                   |
| `useAsync`               | Wraps a promise-returning function with `loading`/`error`/`data` state   |
| `useBeforeUnload`        | `beforeunload` event — "unsaved changes" navigation guard                |
| `useAnimationFrame`      | Declarative `requestAnimationFrame` loop, called with delta time         |
| `useIdleCallback`        | Wraps `requestIdleCallback`/`cancelIdleCallback`, with a Safari fallback |
| `useWebLock`             | Web Locks API — async mutual exclusion across tabs                       |
| `useWorker`              | Offloads work to a `Worker`, with a promise-based `run()`                |
| `usePerformanceObserver` | Wraps `PerformanceObserver` — long tasks, paint timing, and more         |

### State (`state/`)

| Hook                  | What it does                                                                     |
| --------------------- | -------------------------------------------------------------------------------- |
| `useToggle`           | Boolean state with a `toggle()` function                                         |
| `useDebounce`         | Debounced wrapper around a callback                                              |
| `useDebouncedValue`   | Debounces a value directly, without a separate handler                           |
| `useThrottle`         | Throttled wrapper around a callback (leading edge)                               |
| `useThrottledValue`   | Throttles a value directly (leading edge)                                        |
| `useLocalStorage`     | State synced to `localStorage`, with cross-tab sync                              |
| `useSessionStorage`   | State synced to `sessionStorage`                                                 |
| `useIndexedDB`        | State synced to IndexedDB — structured values, async read/write                  |
| `usePrevious`         | The value from the previous render                                               |
| `useCopyToClipboard`  | Clipboard write helper + `copied` state                                          |
| `useCounter`          | Increment/decrement/reset counter state, with optional min/max                   |
| `useTheme`            | `"light"`/`"dark"`/`"system"` mode with persistence, layered on `useColorScheme` |
| `useMap`              | `Map`-backed state with `set`/`delete`/`clear`/`get`/`has`                       |
| `useSet`              | `Set`-backed state with `add`/`delete`/`clear`/`has`                             |
| `useQueue`            | FIFO queue state — `enqueue`/`dequeue`/`clear`, `first`/`last` accessors         |
| `useHistoryState`     | State with undo/redo, over a bounded history stack                               |
| `useSearchParams`     | State synced to the URL query string (`URLSearchParams`)                         |
| `useHashState`        | State synced to `location.hash`, via the `hashchange` event                      |
| `useCookie`           | A single cookie's value, via the Cookie Store API (Chromium-only)                |
| `useCredential`       | Wraps the Credential Management API (`navigator.credentials`)                    |
| `useBroadcastChannel` | Pub/sub state shared across same-origin tabs/workers                             |
| `useWindowMessage`    | Cross-origin window/iframe/popup messaging (`postMessage`)                       |

### Debug / observability (`debug/`)

| Hook                         | What it does                                                                    |
| ---------------------------- | ------------------------------------------------------------------------------- |
| `useUnstableRenderCount`     | Render count for the calling component instance                                 |
| `useUnstableWhyDidYouUpdate` | Logs which props changed to cause the current render                            |
| `useUnstableIsFirstRender`   | `true` only on the mount render                                                 |
| `useUnstableRenderReason`    | Classifies the render cause — `mount`/`props`/`state`/`context`/`parent`        |
| `useUnstableFiber`           | The nearest Fiber node for a ref'd DOM element, via a private react-dom pointer |
| `useUnstableRenderDuration`  | Wraps React `<Profiler>`'s `onRender` timing as a hook                          |
| `useUnstableOwnerStack`      | Wraps React 19's `captureOwnerStack` debug API                                  |

Every hook's TSDoc includes a runnable usage example — hover it in your editor for a quick reference without leaving your code.

More hooks land incrementally.

## Conventions

- Every hook is available both from the top-level package and from its own subpath (`@zap-studio/react-hooks/sensors/use-is-mobile`) — same function either way.
- Hooks relying on private, non-semver-guaranteed APIs (react-dom internals, mostly) carry an `Unstable` marker in the hook's own name — `useUnstableFiber`, not a separate module — so the risk travels with every import and autocomplete hit, not just a path a reader might skip.
- Hooks wrapping Web APIs MDN itself badges "Experimental" carry an `Experimental` marker the same way — `useExperimentalIdleDetector`, not `Unstable` (reserved for private/non-standard internals) — so the browser-support risk is visible at the call site.
</content>

</invoke>
