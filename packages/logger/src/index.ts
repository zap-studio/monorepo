/**
 * Public entrypoint for the logger package.
 *
 * Re-exports the full public API. Every symbol is also available from a
 * dedicated subpath (`@zap-studio/logger/types`, `@zap-studio/logger/console`)
 * for consumers who prefer granular imports. All exports are side-effect
 * free and tree-shakeable.
 *
 * @module @zap-studio/logger
 */

export { ConsoleLogger } from "./console.js";
export type { ConsoleLoggerOptions } from "./console.js";
export type { Logger, LogLevel } from "./types.js";
