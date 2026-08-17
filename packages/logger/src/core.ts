/**
 * Shared `LogLevel` ordering used to compare a call's level against a
 * `minLevel` threshold — not specific to any one `Logger` implementation.
 *
 * @module @zap-studio/logger/core
 */

import type { LogLevel } from "./types.js";

/**
 * `LogLevel` values in increasing verbosity-filtering order, from `"all"`
 * (logs everything) to `"none"` (silences everything). Not specific to any
 * one `Logger` implementation.
 */
export const LOG_LEVEL_ORDER: readonly LogLevel[] = [
  "all",
  "trace",
  "debug",
  "info",
  "warn",
  "error",
  "fatal",
  "none",
];

/**
 * Whether `level` meets or exceeds `minLevel` in {@link LOG_LEVEL_ORDER}.
 */
export const isLevelEnabled = (level: LogLevel, minLevel: LogLevel): boolean =>
  LOG_LEVEL_ORDER.indexOf(level) >= LOG_LEVEL_ORDER.indexOf(minLevel);
