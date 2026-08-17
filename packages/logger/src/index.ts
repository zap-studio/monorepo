/**
 * Public entrypoint for the logger package.
 *
 * Re-exports the full public API. Every symbol is also available from a
 * dedicated subpath (`@zap-studio/logger/types`, `@zap-studio/logger/core`,
 * `@zap-studio/logger/console`, `@zap-studio/logger/format`) for consumers
 * who prefer granular imports. All exports are side-effect free and
 * tree-shakeable.
 *
 * @module @zap-studio/logger
 */

export { ConsoleLogger } from "./console.js";
export type { ConsoleLoggerOptions } from "./console.js";
export { isLevelEnabled, LOG_LEVEL_ORDER } from "./core.js";
export { classicFormat, compactFormat, jsonFormat, prettyFormat } from "./format.js";
export type { CallableLogLevel, Logger, LogFormatter, LogLevel, LogRecord } from "./types.js";
