/**
 * Public entrypoint for the react-hooks package.
 *
 * Re-exports every stable hook, regardless of which category folder it lives
 * in under `src/` — categories are internal organization only, never part of
 * the public export surface. Each hook is also available from its own
 * dedicated subpath (`@zap-studio/react-hooks/use-is-mobile`, ...) for
 * consumers who prefer granular imports. All exports are side-effect free
 * and tree-shakeable.
 *
 * Unstable hooks (relying on private/non-semver-guaranteed APIs) are never
 * re-exported here — see `@zap-studio/react-hooks/unstable`.
 *
 * @module @zap-studio/react-hooks
 */

export { useIsMobile } from "./sensors/use-is-mobile.ts";
export { useMediaQuery } from "./sensors/use-media-query.ts";
