/**
 * Built-in formatters that turn a {@link LogRecord} into the arguments
 * passed to `console[method](...)`. Not specific to `ConsoleLogger` — any
 * `Logger` implementation that writes text can reuse a `LogFormatter`.
 *
 * @module @zap-studio/logger/format
 */

import type { CallableLogLevel, LogRecord } from "./types.ts";

/**
 * A formatter whose output is always one rendered line. Narrower than
 * {@link LogFormatter}, which any third-party formatter satisfies, so callers
 * of these built-ins do not have to narrow `unknown[]` themselves.
 */
type SingleLineFormatter = (record: LogRecord) => [line: string];

/** A formatter that returns the rendered line, plus `context` as a second argument when there is one. */
type LineWithContextFormatter = (
  record: LogRecord,
) => [line: string] | [line: string, context: Record<string, unknown>];

/**
 * Default formatter: the message, plus `context` as a second argument when
 * present. Leaves object inspection to the runtime console (collapsible in
 * browser devtools, `util.inspect` in Node).
 *
 * @example
 * classicFormat({ level: "info", message: "server started", context: { port: 3000 }, timestamp: new Date() });
 * // ["server started", { port: 3000 }]
 */
export const classicFormat: LineWithContextFormatter = (record) =>
  record.context === undefined ? [record.message] : [record.message, record.context];

/**
 * `JSON.stringify` replacer used by {@link jsonFormat}: expands `Error`
 * values into `{ name, message, stack }` and stringifies `bigint` values,
 * since neither survives `JSON.stringify` on its own.
 */
const jsonReplacer = (_key: string, value: unknown) => {
  if (value instanceof Error) {
    return { message: value.message, name: value.name, stack: value.stack };
  }
  if (typeof value === "bigint") {
    return value.toString();
  }
  return value;
};

/**
 * Single-line JSON formatter, pino-compatible field names (`time` as epoch
 * milliseconds, `level`, `msg`). `context` fields are flattened to the top
 * level; a context field named `time`, `level`, or `msg` cannot override the
 * base field. `Error` values serialize as `{ name, message, stack }` instead
 * of `{}`, and `bigint` values as strings, since neither survives
 * `JSON.stringify` on its own.
 *
 * @example
 * jsonFormat({ level: "info", message: "server started", context: { port: 3000 }, timestamp: new Date(0) });
 * // ['{"port":3000,"time":0,"level":"info","msg":"server started"}']
 */
export const jsonFormat: SingleLineFormatter = (record) => [
  JSON.stringify(
    {
      ...record.context,
      level: record.level,
      msg: record.message,
      time: record.timestamp.getTime(),
    },
    jsonReplacer,
  ),
];

const LOGFMT_NEEDS_QUOTING_PATTERN = /[\s"=]/u;

/**
 * Whether a logfmt value needs quoting: empty, or containing whitespace,
 * `"`, or `=`.
 */
const needsLogfmtQuoting = (value: string): boolean =>
  value.length === 0 || LOGFMT_NEEDS_QUOTING_PATTERN.test(value);

/**
 * Wraps a logfmt value in double quotes, escaping backslashes and quotes.
 */
const quoteLogfmtValue = (value: string): string =>
  `"${value.replaceAll("\\", "\\\\").replaceAll('"', '\\"')}"`;

/**
 * Renders a single logfmt value: bare for numbers/booleans/bigints, quoted
 * for strings that need it, `name: message` for `Error`, and JSON (quoted)
 * for everything else.
 */
const formatLogfmtValue = (value: unknown): string => {
  if (value === undefined) {
    return "undefined";
  }
  if (value === null) {
    return "null";
  }
  if (value instanceof Error) {
    return quoteLogfmtValue(`${value.name}: ${value.message}`);
  }
  if (typeof value === "string") {
    return needsLogfmtQuoting(value) ? quoteLogfmtValue(value) : value;
  }
  if (typeof value === "number" || typeof value === "boolean" || typeof value === "bigint") {
    return String(value);
  }
  return quoteLogfmtValue(JSON.stringify(value));
};

/**
 * Single-line `key=value` formatter (logfmt), grep-friendly and still
 * machine-parseable. `context` fields are flattened to the top level; a
 * context field named `time`, `level`, or `msg` cannot override the base
 * field. Values containing whitespace, `"`, or `=` are quoted.
 *
 * @example
 * compactFormat({ level: "info", message: "server started", context: { port: 3000 }, timestamp: new Date(0) });
 * // ['port=3000 time=1970-01-01T00:00:00.000Z level=info msg="server started"']
 */
export const compactFormat: SingleLineFormatter = (record) => {
  const fields = {
    ...record.context,
    level: record.level,
    msg: record.message,
    time: record.timestamp.toISOString(),
  } satisfies Record<string, unknown>;

  return [
    Object.entries(fields)
      .map(([key, value]) => `${key}=${formatLogfmtValue(value)}`)
      .join(" "),
  ];
};

/**
 * Minimal shape of Node/Bun/Deno's `process` global this module reads from,
 * duck-typed since the package targets runtimes without Node's ambient
 * `process` type.
 */
interface NodeProcessLike {
  /**
   * Environment variables; only `NO_COLOR` is read.
   */
  readonly env?: Record<string, string | undefined>;
  /**
   * Standard output stream info; only `isTTY` is read.
   */
  readonly stdout?: { readonly isTTY?: boolean };
}

/**
 * Narrows `globalThis.process` (typed `unknown` since this package targets
 * runtimes without Node's ambient `process` type) to its minimal duck-typed
 * shape.
 */
const isNodeProcessLike = (value: unknown): value is NodeProcessLike =>
  typeof value === "object" && value !== null;

/**
 * Cloudflare Workers sets `navigator.userAgent` to this exact string — the
 * runtime's own documented way to detect itself, since it has no `process`
 * global to check instead.
 *
 * @see https://developers.cloudflare.com/workers/runtime-apis/web-standards/#navigatoruseragent
 */
const CLOUDFLARE_WORKERS_USER_AGENT = "Cloudflare-Workers";

/**
 * Whether the current runtime is Cloudflare Workers, detected via
 * {@link CLOUDFLARE_WORKERS_USER_AGENT}.
 */
const isCloudflareWorkers = (): boolean =>
  typeof navigator !== "undefined" && navigator.userAgent === CLOUDFLARE_WORKERS_USER_AGENT;

/**
 * Whether ANSI colors should be written.
 *
 * - Node/Bun/Deno (anything with a `process` global): only on a real TTY,
 *   and not when `NO_COLOR` is set.
 * - Cloudflare Workers: never. Output can land in `wrangler tail` (a real
 *   terminal, color-safe) or the dashboard's web log viewer (not
 *   color-safe), and there's no way to tell which from inside the Worker —
 *   so this stays off to guarantee clean output in both.
 * - Anywhere else without a `process` global (browsers): unconditionally,
 *   on the assumption it's a devtools-like console.
 */
/** `globalThis` widened with the optional `process` global Node/Bun/Deno expose. */
interface GlobalThisWithProcess {
  process?: unknown;
}

const isColorSupported = (): boolean => {
  // SAFETY: `process` is not part of the `globalThis` type in browser and edge targets. This reads it as an optional untyped property, and `isNodeProcessLike` below checks it.
  const proc: unknown = (globalThis as GlobalThisWithProcess).process;
  if (isNodeProcessLike(proc)) {
    return Boolean(proc.stdout?.isTTY) && proc.env?.["NO_COLOR"] === undefined;
  }

  return !isCloudflareWorkers();
};

const ANSI_ESCAPE = "\u001B";

const LEVEL_COLOR = {
  // cyan
  debug: `${ANSI_ESCAPE}[36m`,
  // red
  error: `${ANSI_ESCAPE}[31m`,
  // magenta
  fatal: `${ANSI_ESCAPE}[35m`,
  // green
  info: `${ANSI_ESCAPE}[32m`,
  // gray
  trace: `${ANSI_ESCAPE}[90m`,
  // yellow
  warn: `${ANSI_ESCAPE}[33m`,
} satisfies Record<CallableLogLevel, string>;
const ANSI_RESET = `${ANSI_ESCAPE}[0m`;
const ANSI_DIM = `${ANSI_ESCAPE}[2m`;
const LEVEL_LABEL_WIDTH = 5;

/**
 * Zero-pads a number to `width` digits.
 */
const pad = (value: number, width = 2): string => String(value).padStart(width, "0");

/**
 * Formats a `Date` as a local `HH:MM:SS.mmm` clock time for
 * {@link prettyFormat}.
 */
const formatClockTime = (date: Date): string =>
  `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}.${pad(date.getMilliseconds(), 3)}`;

/**
 * Human-friendly single-line formatter: a dim local clock time, a
 * color-coded level label, then the message. `context`, when present, is
 * still passed as a second argument for native object inspection instead of
 * being hand-formatted. Color is applied automatically per runtime — on by
 * default, off on a non-TTY or `NO_COLOR` in Node/Bun/Deno, off on
 * Cloudflare Workers — with no configuration needed. See
 * {@link isColorSupported}.
 *
 * @example
 * prettyFormat({ level: "info", message: "server started", context: { port: 3000 }, timestamp: new Date() });
 * // ["12:34:56.789 INFO  server started", { port: 3000 }]  (colored, when supported)
 */
export const prettyFormat: LineWithContextFormatter = (record) => {
  const time = formatClockTime(record.timestamp);
  const label = record.level.toUpperCase().padEnd(LEVEL_LABEL_WIDTH);
  const colored = isColorSupported();
  const color = colored ? LEVEL_COLOR[record.level] : "";
  const reset = colored ? ANSI_RESET : "";
  const dim = colored ? ANSI_DIM : "";
  const prefix = `${dim}${time}${reset} ${color}${label}${reset} ${record.message}`;

  return record.context === undefined ? [prefix] : [prefix, record.context];
};
