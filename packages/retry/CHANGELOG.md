## @zap-studio/retry@0.4.0

### Reduced module surface (breaking)

Folded the orchestration pipeline further: `abort.ts`, `_result-mode.ts`, `_throw-mode.ts`, and `sleep.ts` merged into a single internal `_run.ts` (mirrors `BaseRetryPolicy.run`'s two execution modes).

- Removed the `./abort` and `./sleep` subpath exports.
- Removed the public `sleepWithAbortSignal`, `throwIfAborted`, and `toAbortError` exports — they were orchestration internals with no consumer outside the retry loop, not standalone utilities.
- `defaultSleep` is unaffected and still exported from `@zap-studio/retry` (no dedicated subpath).

## @zap-studio/retry@0.3.2

### Tree-shakeable root re-exports

The package root now re-exports the full public API, so everything can be imported from `@zap-studio/retry` directly (`BaseRetryPolicy`, `ExponentialBackoff`, `FixedDelay`, `RetryError`, `AbortError`, abort helpers, `defaultSleep`, and all public types). All exports are side-effect free and tree-shakeable; granular subpath imports keep working.

- `BaseRetryPolicy` moved from the entrypoint into its own module, available as the new `./base-policy` subpath.
- Removed the `./result-mode` and `./throw-mode` subpath exports. Both were orchestration internals (`runResultMode`, `runThrowMode`) and are no longer part of the public API.

## @zap-studio/retry@0.3.1

### Migrate to ultracite lint/format

Internal formatting and lint cleanup only. No public API or behavior change.

# @zap-studio/retry

## 0.3.0

### Breaking

- **Subpath for error types:** use `@zap-studio/retry/errors` (plural) for `RetryError`, `AbortError`, and related types. A prior JSR `error` subpath that pointed at a non-existent `error.ts` entry is removed; update deep imports from `@zap-studio/retry/error` to `@zap-studio/retry/errors`.

### Changed

- Add dedicated `AbortError` and normalize cancellation paths so retry internals throw/return `RetryError` or `AbortError` instead of plain `Error`.
- Expose `defaultSleep` from the `@zap-studio/retry/sleep` subpath only (the main entry does not re-export it; `run` still uses it internally when `sleep` is omitted).
- Align non-throw exhaustion metadata so `result.attempts` and `result.error.attempts` stay consistent for `RetryError` outcomes.
- In non-throw mode, return a normalized `AbortError` on `result.error` for cancellation; `result.attempts` still reports completed attempts.
- Refactor result-mode internals into smaller helpers for lower complexity and cleaner maintainability.
- Expand docs across README and package docs pages to explain `AbortError` behavior in throw and non-throw modes.
- Split the retry runner into dedicated modules: `throw-mode` (throwing execution path), `result-mode` (non-throw `RetryRunResult` path), and `sleep` (the default `defaultSleep` implementation). `BaseRetryPolicy` in `index` now delegates to these modules without changing public behavior.
- Add exhaustive TSDoc for `result-mode` and other `src` modules, including private helpers, policy option and state fields, and `RetryRunResult` union members.
- Rework test layout into `sleep`, `throw-mode`, `result-mode`, and `index` test files with a shared `sequence-policy` fixture, replacing the prior combined `index` and `abort` test files.

## 0.2.0

### Changed

- Optimize retry runner hot paths by splitting throw/non-throw execution flows and skipping sleep calls when delay is non-positive.
- Add `AbortSignal` support to `run(...)` so retry orchestration can be canceled before or between attempts.
- Add retry benchmarking coverage with core and ecosystem scenarios, including real-world and fair-mode comparisons.
- Add abort-focused ecosystem benchmarks comparing signal overhead and immediate cancellation behavior.
- Expand TSDoc coverage for new runner internals added in this release.

## 0.1.2

### Changed

- Expand TSDoc coverage across retry modules and exported contracts for stronger JSR documentation completeness.

## 0.1.1

### Fixed

- 7004e9f: Allow explicit `undefined` in retry runner options and policy configuration typing.

### Changed

- e9903c5: Removed redundant `| undefined` unions from public retry option and decision types.

## 0.1.0

### Added

- Introduced a transport-agnostic `RetryPolicy` contract with `RetryDecisionInput` and `RetryDecision`.
- Added required `onExhausted` hook to `RetryPolicy` for policy-specific terminal error shaping.
- Added shared `BaseRetryPolicy` abstract class to centralize default `onExhausted` behavior.
- Added `BaseRetryPolicy.run(execute, options)` runner method to execute retry policies with minimal boilerplate.
- Added `throwOnExhausted` runner option with non-throw `RetryRunResult<T>` mode.
- Added `ExponentialBackoff` policy with bounded exponential delay via `baseDelayMs`, `maxDelayMs`, and `maxAttempts`.
- Added `FixedDelay` policy with constant delay and bounded attempts.
- Added `RetryError` for exhausted-retry failures with structured attempt/error/data context.

### Documentation

- Documented throwable behavior on `RetryPolicy`, `BaseRetryPolicy.run`, and related contracts with explicit `@throws` tags for policy, exhaustion, and custom `sleep` failures.
