# @zap-studio/react-hooks

Small, focused React hooks. Each one ships as its own subpath export, so importing one never pulls in the others.

## Motivation

Most React hook collections are either one giant package (import a `useDebounce` and your bundle quietly gains forty other hooks' worth of code) or a pile of one-off gists copy-pasted between projects, each with its own subtly different bugs around SSR safety and cleanup.

Every hook in `@zap-studio/react-hooks` ships as its own standalone, side-effect-free module — import it on its own and it tree-shakes cleanly. Hooks never depend on each other, so pulling in `useIsMobile` never drags in unrelated code.

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

| Hook                        | What it does                                                                             |
| --------------------------- | ---------------------------------------------------------------------------------------- |
| `useMediaQuery`             | Matches the viewport against an arbitrary CSS media query string                         |
| `useIsMobile`               | `true` below a breakpoint (768px by default) — built on `useMediaQuery`                  |
| `useIsClient`               | `true` only after the client has mounted — SSR hydration guard                           |
| `useIsServer`               | `true` only during server rendering — the inverse of `useIsClient`                       |
| `useColorScheme`            | `"dark"` or `"light"`, from `(prefers-color-scheme: dark)`                               |
| `usePrefersDarkMode`        | Boolean shorthand for `useColorScheme() === "dark"`                                      |
| `useOnlineStatus`           | Tracks `navigator.onLine`, updating on `online`/`offline` events                         |
| `useNetworkState`           | `useOnlineStatus` plus `navigator.connection` info where supported                       |
| `usePreferredLanguage`      | `navigator.language`/`navigator.languages`, updating on `languagechange`                 |
| `useOrientation`            | `screen.orientation`'s `angle`/`type`, updating on orientation change                    |
| `useGeolocation`            | Wraps `navigator.geolocation`; one-shot by default, `watch: true` for continuous updates |
| `useBattery`                | Wraps the Battery Status API (Chromium-only); `supported: false` elsewhere               |
| `useWindowSize`             | `window.innerWidth`/`innerHeight`, updating on `resize`                                  |
| `useDocumentVisibility`     | `document.visibilityState`, updating on `visibilitychange`                               |
| `usePageLeave`              | Calls a handler when the pointer leaves the viewport — exit-intent UI                    |
| `useShare`                  | Wraps the Web Share API (`navigator.share`), with `canShare` feature-detection           |
| `usePermission`             | `navigator.permissions.query({ name })`'s state for a given permission                   |
| `useVibrate`                | Wraps `navigator.vibrate()` — mostly Android Chrome; no-op elsewhere                     |
| `useWakeLock`               | Screen Wake Lock; auto-released on tab hide/unmount                                      |
| `useStorageEstimate`        | `navigator.storage.estimate()`'s `usage`/`quota`, one-shot on mount                      |
| `useDeviceCapabilities`     | `navigator.hardwareConcurrency`/`deviceMemory` (latter Chromium-only)                    |
| `useDeviceOrientation`      | Accelerometer/magnetometer tilt; iOS requires a `requestPermission()` gesture            |
| `useDeviceMotion`           | Accelerometer motion; same iOS permission caveat as `useDeviceOrientation`               |
| `useVisualViewport`         | `window.visualViewport`; captures on-screen-keyboard shrink `innerHeight` misses         |
| `useDevicePixelRatio`       | `window.devicePixelRatio`, updating on zoom/monitor moves                                |
| `useTouchSupport`           | `true` when `navigator.maxTouchPoints > 0`                                               |
| `useUserAgentData`          | `navigator.userAgentData`'s low-entropy fields — structured `navigator.userAgent`        |
| `useCookieEnabled`          | `navigator.cookieEnabled`                                                                |
| `useVirtualKeyboard`        | `navigator.virtualKeyboard`'s bounding rect (Chromium-only)                              |
| `usePrintMode`              | `true` while printing, via the `print` media query                                       |
| `useNotificationPermission` | Notifications API permission state + a `notify()` trigger                                |
| `useFontsReady`             | `true` once `document.fonts.ready` resolves — avoid FOUC on custom web fonts             |
| `useKeyPress`               | `true` while any of the given key(s) is held down                                        |
| `useHotkeys`                | Registers `"ctrl+s"`-style keyboard shortcut combos mapped to handlers                   |
| `useIdle`                   | `true` after a period of no mouse/keyboard/touch/scroll activity                         |
| `useGamepad`                | Connected gamepads, via `navigator.getGamepads()` + connect/disconnect events            |
| `useUserActivation`         | `navigator.userActivation`'s `isActive`/`hasBeenActive` — gate autoplay/popups           |
| `usePointerLock`            | Pointer Lock API wrapper for a ref'd element (games, drag-to-look UIs)                   |
| `useInstallPrompt`          | Custom "Add to Home Screen" UI, wrapping `beforeinstallprompt`/`appinstalled`            |
| `useServiceWorker`          | Service Worker registration + update-available state                                     |
| `useAppBadge`               | Wraps the Badging API (`navigator.setAppBadge`/`clearAppBadge`)                          |
| `useWebSocket`              | WebSocket connection state + `send()`/`close()`, latest message received                 |
| `useEventSource`            | Server-Sent Events connection state + latest message data                                |

Every hook's TSDoc includes a runnable usage example — hover it in your editor for a quick reference without leaving your code.

More hooks land incrementally.

## Conventions

- Every stable hook is available both from the top-level package and from its own subpath (`@zap-studio/react-hooks/sensors/use-is-mobile`) — same function either way.
- Hooks relying on private, non-semver-guaranteed APIs live under `@zap-studio/react-hooks/unstable` and are never exported from the top-level package.
