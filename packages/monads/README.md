# @zap-studio/monads

`Result`/`Option` types and Rust-style functional combinators for explicit, type-safe error handling — an alternative to throw/catch and nullable checks.

Full documentation: [zapstudio.dev/monads](https://www.zapstudio.dev/monads)

## Motivation

Hand-rolled `{ ok: boolean, ... }` result shapes and nullable checks are easy to write once and painful to keep consistent across a codebase. Libraries like [neverthrow](https://github.com/supermacro/neverthrow) and [Effect](https://effect.website/) solve this well, but pull in more surface (do-notation, a runtime, generators, `Either`, class-based fluent APIs) than most projects need.

`@zap-studio/monads` is deliberately small: `Result`, `ResultAsync`, and `Option`, as standalone, tree-shakeable functions composed with `pipe` — not class instances with chained methods.

## Installation

```bash
npm install @zap-studio/monads
```

## Features

- **`Result<T, E>`** — `ok`/`err` constructors, `isOk`/`isErr` guards, and `Result.map`/`Result.mapErr`/`Result.andThen`/`Result.orElse`/`Result.unwrapOr`/`Result.unwrapOrElse`/`Result.unwrap`/`Result.match` combinators.
- **`ResultAsync<T, E>`** — a thenable wrapper around `Promise<Result<T, E>>`, awaitable directly, with chainable `map`/`mapErr`/`andThen`/`orElse`/`match` for building async pipelines before the final `await`.
- **`Option<T>`** — `some`/`none` constructors, `isSome`/`isNone` guards, and `Option.map`/`Option.andThen`/`Option.orElse`/`Option.unwrapOr`/`Option.unwrapOrElse`/`Option.unwrap`/`Option.match` combinators.
- **Bridges** — `fromThrowable` (sync throwing function → `Result`), `fromPromise` (rejecting `Promise` → `ResultAsync`), `fromNullable` (`T | null | undefined` → `Option`).
- **`pipe`** — left-to-right composition for the standalone combinators above; there's no native pipe operator in TypeScript.
- **Zero dependencies, tree-shakeable** — every export is a standalone value or function; unused ones are dropped by any modern bundler.

## Quick Start

```ts
import { err, ok, pipe, Result } from "@zap-studio/monads";

function parseAge(input: string): Result<number, string> {
  const value = Number(input);
  return Number.isNaN(value) ? err("not a number") : ok(value);
}

const message = pipe(
  parseAge("42"),
  Result.map((age) => age + 1),
  Result.match({
    ok: (age) => `Age next year: ${age}`,
    err: (reason) => `Invalid input: ${reason}`,
  }),
);

pipe(
  parseAge("not a number"),
  Result.orElse(() => ok(0)),
); // Ok(0), recovered from Err
```

## Option

```ts
import { fromNullable, Option, pipe, some } from "@zap-studio/monads";

const found = fromNullable([1, 2, 3].find((n) => n > 5));

pipe(
  found,
  Option.map((n) => n * 2),
  Option.unwrapOr(0),
); // 0, since nothing in [1, 2, 3] is greater than 5

pipe(
  found,
  Option.orElse(() => some(-1)),
); // Some(-1), recovered from None
```

## Async

```ts
import { fromPromise } from "@zap-studio/monads";

const user = fromPromise(
  fetch("/api/user").then((response) => response.json()),
  (error) => `request failed: ${String(error)}`,
).map((data) => data.name);

const message = await user.match({
  ok: (name) => `Hello, ${name}`,
  err: (reason) => reason,
});
```

## Types

All public types (`Ok`, `Err`, `Result`, `ResultMatchers`, `Some`, `None`, `Option`, `OptionMatchers`) live in `@zap-studio/monads/types` and are also re-exported from the package root.

## Runtime Support

| Runtime            | Minimum version                                  |
| ------------------ | ------------------------------------------------ |
| Node.js            | 18.0.0                                           |
| Bun                | 1.0.0                                            |
| Deno               | 1.42                                             |
| Cloudflare Workers | Any current release                              |
| Browsers           | Latest evergreen (Chrome, Edge, Firefox, Safari) |

The package ships standard ESM only and uses no runtime-specific APIs. Deno 1.42 is the first release that can install packages from JSR (`deno add jsr:@zap-studio/monads`).

## License

MIT
