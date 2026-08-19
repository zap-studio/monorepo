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

export type { BatteryState } from "./sensors/use-battery.ts";
export { useBattery } from "./sensors/use-battery.ts";
export type { ColorScheme } from "./sensors/use-color-scheme.ts";
export { useColorScheme } from "./sensors/use-color-scheme.ts";
export type {
  GeolocationCoordinatesState,
  GeolocationErrorState,
  GeolocationState,
  UseGeolocationOptions,
} from "./sensors/use-geolocation.ts";
export { useGeolocation } from "./sensors/use-geolocation.ts";
export { useIsClient } from "./sensors/use-is-client.ts";
export { useIsMobile } from "./sensors/use-is-mobile.ts";
export { useIsServer } from "./sensors/use-is-server.ts";
export { useMediaQuery } from "./sensors/use-media-query.ts";
export type { NetworkState } from "./sensors/use-network-state.ts";
export { useNetworkState } from "./sensors/use-network-state.ts";
export { useOnlineStatus } from "./sensors/use-online-status.ts";
export type { Orientation } from "./sensors/use-orientation.ts";
export { useOrientation } from "./sensors/use-orientation.ts";
export { usePrefersDarkMode } from "./sensors/use-prefers-dark-mode.ts";
export type { PreferredLanguage } from "./sensors/use-preferred-language.ts";
export { usePreferredLanguage } from "./sensors/use-preferred-language.ts";
