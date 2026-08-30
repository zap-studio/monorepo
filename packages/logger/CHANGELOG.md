# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.1.0]

### Changed

The four built-in formatters now say the exact shape they return. Before, they used the wide `unknown[]` type from the `LogFormatter` contract. `jsonFormat` and `compactFormat` return `[line: string]`. `classicFormat` and `prettyFormat` return `[line: string]` or `[line: string, context: Record<string, unknown>]`. You no longer need a cast to read a formatter's output. `LogFormatter` itself did not change, so any formatter you write, and any code that stores these four as a `LogFormatter`, still works.

## [2.0.0]

### Added

Automatic trace-log correlation through OpenTelemetry. `ConsoleLogger` now adds the active span's `trace_id`/`span_id` to every log call's context, when a span is active. This is not a full bridge to the OTel Logs API. It just adds correlation on top of the existing `Logger` abstraction. If you pass your own `trace_id`/`span_id`, that value wins. See [OpenTelemetry](https://www.zapstudio.dev/logger/opentelemetry).

### Changed

**Breaking:** `@opentelemetry/api` is now a required peer dependency. It is small, has no side effects, and does nothing until an app sets up a real SDK. So nothing changes at runtime if you don't set one up. But the package will not install without it: run `npm install @opentelemetry/api`.

## [1.0.0]

### Added

Initial release. `Logger` interface (`trace`/`debug`/`info`/`warn`/`error`/`fatal`) and a `ConsoleLogger` implementation with a configurable `minLevel` filter.

`ConsoleLogger` now has a `format?: LogFormatter` option. It defaults to `classicFormat` (today's plain `message` + `context` output). There are three more built-in formatters, all from `@zap-studio/logger/format`: `jsonFormat` (single-line, pino-compatible field names), `compactFormat` (single-line logfmt `key=value`), and `prettyFormat` (colored, TTY-aware). All four flatten `context` fields to the top level. All four also safely turn `Error`/`bigint` context values into text, instead of losing them to `JSON.stringify`'s default behavior.

`prettyFormat`'s color detection needs no setup and works the same in every runtime. On Node, Bun, and Deno, it checks the TTY and `NO_COLOR`. In browsers, it always uses color. On Cloudflare Workers, it never uses color (it detects Workers through `navigator.userAgent`), because that runtime has no `process` global and no safe way to know if the output goes to a color-safe terminal (`wrangler tail`) or to the dashboard's web log viewer.
