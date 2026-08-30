# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.1.1]

### Changed

We removed the `@zap-studio/monads` dependency and the `runRetryPolicyResult` export from 2.1.0. They added a dependency and more bundle size, for something you can already do yourself: wrap `runRetryPolicy` with `@zap-studio/monads`'s `fromPromise`. See the README section "Using with `@zap-studio/monads`". 2.1.0 is deprecated on npm — use this release instead.

## [2.1.0] (deprecated — see 2.1.1)

### Added

- Added `runRetryPolicyResult(policy, execute, options?)`. It is like `runRetryPolicy`, but returns a `ResultAsync` instead, using the new `@zap-studio/monads` dependency. This is new and optional — `runRetryPolicy` (both throw and non-throw modes) stays the same. `runRetryPolicyResult` has no `throwOnExhausted` option; it always returns a `Result`. The `Err` value is the same `RetryError`/`AbortError` object that `runRetryPolicy`'s throw mode would throw, so `RetryError.attempts`/`lastError`/`lastData` and `AbortError.cause` are kept.

## [2.0.0]

### Added

Added native OpenTelemetry support. `fetch`, `webhooks`, and `permit` each create their own span. This package does not, because a retry loop wraps someone else's work. Instead, each decision is recorded as an event (`retry.scheduled`/`retry.exhausted`) on whatever span is already active, plus a `retry.attempts` counter tagged by outcome. See [OpenTelemetry](https://www.zapstudio.dev/retry/opentelemetry).

### Changed

**Breaking:** `@opentelemetry/api` is now a required peer dependency. It is small, has no side effects, and does nothing until an app sets up a real SDK, so nothing changes at runtime if you don't set one up. But the package won't resolve without it installed: `npm install @opentelemetry/api`.

## [1.2.1]

### Changed

`@zap-studio/logger` is now an optional peer dependency, not a regular one. Every import from it is type-only (`import type { Logger }`), so it was never loaded at runtime — you can pass any object with the `Logger` shape (including `pino`), with no install needed. If you already use `logger?: Logger`, nothing changes for you.

## [1.2.0]

### Added

`runRetryPolicy(...)` now takes an optional `logger?: Logger` option (from `@zap-studio/logger`). If you pass it, it logs each retry decision at `debug` level (attempt, delay, reason), exhaustion at `warn`, and cancellation at `debug`. If you don't pass it, there is no extra logging cost. See [Logging](https://www.zapstudio.dev/retry/logging).

## [1.1.0]

### Added

`exponentialBackoff(...)` and `linearBackoff(...)` now take an optional `jitter?: "full" | "equal" | JitterOptions` option. It changes the delay after the delay is capped at `maxDelayMs`. `"full"` picks a random value in `[0, delayMs]`. `"equal"` keeps at least half the delay, and picks a random value in `[delayMs/2, delayMs]`. Pass `{ mode, random }` to use your own random source — useful for tests that need the same result every time.

New export: `applyJitter(delayMs, jitter?)`, also available from the `./jitter` subpath. See [Jitter](https://www.zapstudio.dev/retry/jitter).

## [1.0.0]

### Added

`RetryPolicy` now has an optional `isKnownError?: (error: unknown) => error is TError` hook. `BaseRetryPolicy.run(...)` calls it before it hands a caught value to `next(...)`/`onExhausted(...)`. By default, `BaseRetryPolicy.isKnownError` checks `error instanceof Error`.

- Override `isKnownError` when `TError` is a narrower subclass, like an HTTP error or a domain-specific error. This gives you real type narrowing, instead of just assuming `instanceof Error`, and stops unrelated `Error` types from being retried as if they belonged to your domain.

See [Narrow the Error Domain](https://www.zapstudio.dev/retry/custom-policies#narrow-the-error-domain) for how to override it.

New built-in policy: `linearBackoff(options)`. It adds a fixed `incrementMs` to the delay after each failed attempt, up to `maxDelayMs` — steadier growth than `exponentialBackoff`, bigger gaps than `fixedDelay`. See [linearBackoff](https://www.zapstudio.dev/retry/linear-backoff).

### Changed

- **Breaking:** `TError` must now extend `Error`, and defaults to `Error` (before, it was `TError = unknown`). This applies to `RetryPolicy`, `RetryDecisionInput`, `RetryExhaustedInput`, and `BaseRetryPolicy`.
- **Breaking behavior change:** if a rejection has a non-`Error` value (a thrown string, a plain object, `undefined`, and so on), that attempt now skips retry completely — it no longer reaches `next(...)`, and no delay or backoff is applied. Before, any thrown value went to the policy unchanged. In throw mode, `run(...)` now rethrows the value as-is. With `throwOnExhausted: false`, it wraps the value in a `RetryError` and returns it on `result.error` — `run(...)` never throws in that mode.
- **Breaking:** Policies are now plain objects, not classes. This helps tree-shaking: a bundler can drop an unused policy factory and its defaults completely, which it could not do with a shared class hierarchy. `ExponentialBackoff`/`FixedDelay` classes are gone — use the `exponentialBackoff(options)`/`fixedDelay(options)` factory functions instead, both returning a `RetryPolicy`. Change `new ExponentialBackoff(opts)` to `exponentialBackoff(opts)`, and `new FixedDelay(opts)` to `fixedDelay(opts)`.
- **Breaking:** `RetryPolicy.onExhausted` is now optional (before, it was required). Leave it out to get the same default `RetryError` that `BaseRetryPolicy.onExhausted` used to build.

### Removed

- **Breaking:** `BaseRetryPolicy` is removed. Retry runs now go through the standalone function `runRetryPolicy(policy, execute, options?)`, which accepts any object matching `RetryPolicy` — no subclass needed. Change `policy.run(execute, options)` to `runRetryPolicy(policy, execute, options)`. If your custom policy extended `BaseRetryPolicy` and overrode `next`/`onExhausted`/`isKnownError`, turn it into a plain object with the same members instead; see [Custom Policies](https://www.zapstudio.dev/retry/custom-policies).

### Removed

Moved abort/sleep internals out of the public API.

- Removed the `./abort` and `./sleep` subpath exports.
- Removed the public `sleepWithAbortSignal`, `throwIfAborted`, and `toAbortError` exports — they were internal parts of the retry loop, not standalone tools, and nothing outside the retry loop used them.
- `defaultSleep` is not affected. It is still exported from `@zap-studio/retry` (no separate subpath).

## [0.3.2]

### Added

The package root now re-exports the full public API, so you can import everything straight from `@zap-studio/retry` (`BaseRetryPolicy`, `ExponentialBackoff`, `FixedDelay`, `RetryError`, `AbortError`, abort helpers, `defaultSleep`, and all public types). Every export has no side effects and supports tree-shaking; the smaller subpath imports still work too.

- `BaseRetryPolicy` moved out of the main entrypoint. It now has its own module, at the new `./base-policy` subpath.

### Removed

- Removed the `./result-mode` and `./throw-mode` subpath exports. Both held internal code (`runResultMode`, `runThrowMode`) that is no longer part of the public API.

## [0.3.1]

### Changed

Internal formatting and lint cleanup only. No public API or behavior change.

## [0.3.0]

### Changed

- **Breaking:** New subpath for error types: use `@zap-studio/retry/errors` (plural) for `RetryError`, `AbortError`, and related types. The old JSR `error` subpath pointed at an `error.ts` file that did not exist, so it is removed — change deep imports from `@zap-studio/retry/error` to `@zap-studio/retry/errors`.
- Added a dedicated `AbortError` type. Cancellation is now consistent: retry internals throw or return `RetryError` or `AbortError`, not a plain `Error`.
- `defaultSleep` is now only exposed from the `@zap-studio/retry/sleep` subpath — the main entry does not re-export it. `run` still uses it inside, when you don't pass your own `sleep`.
- Made non-throw exhaustion data consistent: `result.attempts` and `result.error.attempts` now always match for `RetryError` outcomes.
- In non-throw mode, cancellation now returns a normalized `AbortError` on `result.error`. `result.attempts` still shows the number of completed attempts.
- Split the result-mode internals into smaller helper functions, to make the code simpler and easier to keep up.
- Added more docs in the README and the package docs pages about `AbortError` behavior, in both throw and non-throw modes.
- Split the retry runner into separate modules: `throw-mode` (the throwing path), `result-mode` (the non-throw `RetryRunResult` path), and `sleep` (the default `defaultSleep` code). `BaseRetryPolicy` in `index` now calls these modules, with no change in public behavior.
- Added full TSDoc for `result-mode` and other `src` modules: private helpers, policy option and state fields, and every `RetryRunResult` union member.
- Reworked the test layout into `sleep`, `throw-mode`, `result-mode`, and `index` test files, with one shared `sequence-policy` fixture, replacing the old combined `index` and `abort` test files.

## [0.2.0]

### Changed

- Made the retry runner's hot paths faster: throw and non-throw modes now run separately, and a sleep call is skipped when the delay is zero or less.
- Added `AbortSignal` support to `run(...)`, so you can cancel a retry before or between attempts.
- Added retry benchmarks, with core and ecosystem scenarios, including real-world and fair-mode comparisons.
- Added abort-focused benchmarks that compare signal overhead and instant cancellation.
- Added more TSDoc for the new runner internals in this release.

## [0.1.2]

### Changed

- Added more TSDoc across retry modules and exported types, for more complete JSR docs.

## [0.1.1]

### Fixed

- 7004e9f: Allow explicit `undefined` in retry runner options and policy configuration typing.

### Changed

- e9903c5: Removed redundant `| undefined` unions from public retry option and decision types.

## [0.1.0]

### Added

- Added a transport-agnostic `RetryPolicy` contract, with `RetryDecisionInput` and `RetryDecision`.
- Added a required `onExhausted` hook on `RetryPolicy`, so each policy can shape its own final error.
- Added a shared `BaseRetryPolicy` abstract class, to hold the default `onExhausted` behavior in one place.
- Added a `BaseRetryPolicy.run(execute, options)` method, to run a retry policy with little setup code.
- Added a `throwOnExhausted` option, plus a non-throw `RetryRunResult<T>` mode.
- Added an `ExponentialBackoff` policy. Its delay grows with `baseDelayMs`, up to `maxDelayMs`, and stops at `maxAttempts`.
- Added a `FixedDelay` policy, with a fixed delay and a limited number of attempts.
- Added `RetryError` for a failure after retries run out, holding the attempt count, the last error, and the last data.
- Documented when `RetryPolicy`, `BaseRetryPolicy.run`, and related types throw, with `@throws` tags for policy errors, exhaustion, and custom `sleep` failures.
