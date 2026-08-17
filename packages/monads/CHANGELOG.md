# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0]

### Added

Initial release of `@zap-studio/monads`.

- `Result<T, E>`: `ok()`, `err()`, `isOk()`, `isErr()`, `fromThrowable()`, and the `Result` namespace (`map`, `mapErr`, `andThen`, `unwrapOr`, `unwrapOrElse`, `unwrap`, `match`).
- `ResultAsync<T, E>`: a thenable wrapper around `Promise<Result<T, E>>` with chainable `map()`, `mapErr()`, `andThen()`, `match()`, plus `fromPromise()`.
- `Option<T>`: `some()`, `none()`, `isSome()`, `isNone()`, `fromNullable()`, and the `Option` namespace (`map`, `andThen`, `unwrapOr`, `unwrapOrElse`, `unwrap`, `match`).
- `pipe()`: left-to-right composition for chaining the standalone combinators above.
- Public types (`Ok`, `Err`, `Result`, `ResultMatchers`, `Some`, `None`, `Option`, `OptionMatchers`) in a dedicated `@zap-studio/monads/types` module.
