# `@zap-studio/monads` package design

Implements [issue #575](https://github.com/zap-studio/monorepo/issues/575).

## Summary

New standalone package: `Result<T, E>`, `ResultAsync<T, E>`, `Option<T>` types with
Rust-style functional combinators. Not a dependency of any existing `packages/*` —
that's out of scope for this issue.

## Scope

Full v1 API surface is defined in issue #575 and is not repeated here in full; this
document covers the technical decisions the issue leaves open: composition style,
data shapes, name-collision resolution, file layout, and error behavior.

## Composition style: curried, pipeable functions

Combinators are standalone functions that take their "argument" (transform fn,
default, matcher) and return a function from `Result`/`Option` to `Result`/`Option`:

```ts
const map: <T, U>(fn: (value: T) => U) => <E>(result: Result<T, E>) => Result<U, E>;
```

This is why `pipe` exists — there's no method chaining (`result.map().andThen()`),
so composition goes through `pipe(value, ...fns)`. This is the "standalone
functions, pipeable" style called out in the issue, and it's why `pipe` is listed
as a Core requirement rather than a nice-to-have.

`ResultAsync` is the sole exception: it must be a thenable object (`await
resultAsync` works directly), so it's a class with instance methods (`map`,
`mapErr`, `andThen`, `match`) for chaining before the await. This does not
reintroduce the "class-based fluent API" non-goal, which applies to `Result` and
`Option` only — those stay plain discriminated unions with standalone functions.

## Data shapes

Plain discriminated unions, not classes, for `Result` and `Option`:

```ts
type Ok<T> = { readonly ok: true; readonly value: T };
type Err<E> = { readonly ok: false; readonly error: E };
type Result<T, E> = Ok<T> | Err<E>;

type Some<T> = { readonly some: true; readonly value: T };
type None = { readonly some: false };
type Option<T> = Some<T> | None;
```

## Name-collision resolution

`Result` and `Option` both define `map`, `andThen`, `unwrapOr`, `unwrapOrElse`,
`unwrap`, and `match` with different signatures (`Option` has no `mapErr` — no
error channel). These are exposed from the root entrypoint as namespace objects:

```ts
export const Result = { map, mapErr, andThen, unwrapOr, unwrapOrElse, unwrap, match };
export const Option = { map, andThen, unwrapOr, unwrapOrElse, unwrap, match };
```

Constructors, guards, and `from*` factories have no naming collision and stay bare
top-level exports: `ok`, `err`, `isOk`, `isErr`, `fromThrowable`, `some`, `none`,
`isSome`, `isNone`, `fromNullable`, `fromPromise`, `pipe`, `ResultAsync`.

Usage:

```ts
import { Result, Option, ok, some, pipe } from "@zap-studio/monads";

pipe(
  ok(5),
  Result.map((n) => n + 1),
  Result.andThen((n) => (n > 0 ? ok(n) : err("negative")))
);

pipe(some(5), Option.map((n) => n * 2));
```

Each subpath module (`./result`, `./option`) still exports its combinators as flat
named functions — the collision only exists at the merged root entrypoint, so
subpath imports need no namespacing:

```ts
import { map, andThen } from "@zap-studio/monads/result";
```

## Error behavior

`unwrap()` throws a plain `Error` (no custom error class — nothing to enrich
beyond the original value):

- `Result`: `Error("Called unwrap() on an Err value")`, `{ cause: error }`
- `Option`: `Error("Called unwrap() on a None value")`

## File layout

Mirrors `packages/validation`'s one-concern-per-module split:

```
packages/monads/
  src/
    result.ts          Ok, Err, Result, ok, err, isOk, isErr, map, mapErr,
                        andThen, unwrapOr, unwrapOrElse, unwrap, match, fromThrowable
    result-async.ts    ResultAsync class, fromPromise
    option.ts          Some, None, Option, some, none, isSome, isNone, map,
                        andThen, unwrapOr, unwrapOrElse, unwrap, match, fromNullable
    pipe.ts            pipe(value, ...fns), overloaded up to ~10 args
    index.ts           Result/Option namespace objects, bare re-exports, ResultAsync, pipe
    *.browser.test.ts  one per module — no Node-only APIs used anywhere in this
                        package, so all tests are browser tests (matches the
                        `validation` package's convention: default to
                        `.browser.test.ts` unless a module needs a Node-only API)
  package.json, jsr.json, tsconfig.json, README.md, CHANGELOG.md, LICENSE
    — copied/adapted from packages/validation's scaffold (no otel/logger peer deps)
```

Subpath exports (`package.json#exports`, `jsr.json#exports`, both tsdown-managed):
`.`, `./result`, `./result-async`, `./option`, `./pipe`, `./package.json`.

## Docs & repo wiring

- `apps/docs/src/pages/monads/*.mdx` — overview + getting-started + one page per
  module (result, result-async, option, pipe), file-routed like existing packages
  (waku); no nav config to touch, routing is auto-generated from the file tree.
- Root `README.md` package table gets one new row for `@zap-studio/monads`.

## Out of scope (unchanged from issue)

`Either`, do-notation/generators, Task/IO monads, Validation/accumulate-errors,
class-based fluent API for `Result`/`Option`, schema integration, and adoption in
any existing `packages/*`.
