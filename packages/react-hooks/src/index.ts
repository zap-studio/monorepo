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

export { useIsClient } from "./sensors/use-is-client.ts";
export { useIsMobile } from "./sensors/use-is-mobile.ts";
export { useIsServer } from "./sensors/use-is-server.ts";
export { useMediaQuery } from "./sensors/use-media-query.ts";
