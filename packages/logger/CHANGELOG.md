# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0]

### Added

Initial release. `Logger` interface (`trace`/`debug`/`info`/`warn`/`error`/`fatal`) and `ConsoleLogger` implementation with configurable `minLevel` filtering.

`ConsoleLogger` gains a `format?: LogFormatter` option, defaulting to `classicFormat` (today's plain `message` + `context` output). Three more built-in formatters, all from `@zap-studio/logger/format`: `jsonFormat` (single-line, pino-compatible field names), `compactFormat` (single-line logfmt `key=value`), and `prettyFormat` (colorized, TTY-aware). All flatten `context` fields to the top level and safely serialize `Error`/`bigint` context values instead of losing them to `JSON.stringify`'s default behavior.

`prettyFormat`'s color detection is fully runtime-agnostic with no configuration: TTY + `NO_COLOR`-aware on Node/Bun/Deno, unconditionally colored in browsers, and never colored on Cloudflare Workers (detected via `navigator.userAgent`) — the runtime has no `process` global and no reliable way to know whether output lands in a color-safe terminal (`wrangler tail`) or the dashboard's web log viewer.
