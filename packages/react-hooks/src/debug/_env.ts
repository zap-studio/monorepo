declare const process: { env?: { NODE_ENV?: string } } | undefined;

/**
 * Checks whether this is a production build. Every unstable debug hook
 * uses this to turn itself off in production, the same way React's own
 * dev-only warnings work. These hooks are dev tools, not something your
 * app should rely on at runtime.
 *
 * We check `typeof process` first because `process` does not exist in a
 * browser when the code isn't bundled. Without that check, this would
 * throw an error instead of simply returning `false`.
 */
export const isProductionBuild = (): boolean =>
  typeof process !== "undefined" && process?.env?.NODE_ENV === "production";
