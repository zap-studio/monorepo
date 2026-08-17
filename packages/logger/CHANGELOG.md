# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0]

### Added

Automatic trace-log correlation through OpenTelemetry. `ConsoleLogger` now stamps the active span's `trace_id`/`span_id` onto every log call's context when a span is active — not a full bridge to the OTel Logs API, just correlation on top of the existing `Logger` abstraction. An explicit `trace_id`/`span_id` you pass yourself takes precedence. See [OpenTelemetry](https://www.zapstudio.dev/logger/opentelemetry).

### Changed

**Breaking:** `@opentelemetry/api` is now a required peer dependency. It's tiny, side-effect-free, and a no-op until an app registers a real SDK, so nothing changes at runtime for consumers who don't set one up — but the package won't resolve without it installed: `npm install @opentelemetry/api`.

## [1.0.0]

### Added

Initial release. `Logger` interface (`trace`/`debug`/`info`/`warn`/`error`/`fatal`) and `ConsoleLogger` implementation with configurable `minLevel` filtering.

`ConsoleLogger` gains a `format?: LogFormatter` option, defaulting to `classicFormat` (today's plain `message` + `context` output). Three more built-in formatters, all from `@zap-studio/logger/format`: `jsonFormat` (single-line, pino-compatible field names), `compactFormat` (single-line logfmt `key=value`), and `prettyFormat` (colorized, TTY-aware). All flatten `context` fields to the top level and safely serialize `Error`/`bigint` context values instead of losing them to `JSON.stringify`'s default behavior.

`prettyFormat`'s color detection is fully runtime-agnostic with no configuration: TTY + `NO_COLOR`-aware on Node/Bun/Deno, unconditionally colored in browsers, and never colored on Cloudflare Workers (detected via `navigator.userAgent`) — the runtime has no `process` global and no reliable way to know whether output lands in a color-safe terminal (`wrangler tail`) or the dashboard's web log viewer.
