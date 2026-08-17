/**
 * Public entrypoint for the monads package.
 *
 * Re-exports the `Result`/`Option` types, their constructors and guards as
 * bare functions, and their overlapping combinators (`map`, `andThen`,
 * `unwrapOr`, `unwrapOrElse`, `unwrap`, `match`, plus `mapErr` on `Result`
 * only) grouped under `Result` and `Option` namespace objects to avoid a
 * naming collision. Every symbol is also available from a dedicated subpath
 * (`@zap-studio/monads/result`, `/result-async`, `/option`, `/pipe`,
 * `/types`) as flat named exports, with no namespacing needed there. All
 * exports are side-effect free and tree-shakeable.
 *
 * @module @zap-studio/monads
 */

import {
  andThen as optionAndThen,
  map as optionMap,
  match as optionMatch,
  orElse as optionOrElse,
  unwrap as optionUnwrap,
  unwrapOr as optionUnwrapOr,
  unwrapOrElse as optionUnwrapOrElse,
} from "./option.js";
import {
  andThen as resultAndThen,
  map as resultMap,
  mapErr as resultMapErr,
  match as resultMatch,
  unwrap as resultUnwrap,
  unwrapOr as resultUnwrapOr,
  unwrapOrElse as resultUnwrapOrElse,
} from "./result.js";
import type { Option as OptionType, Result as ResultType } from "./types.js";

export { fromNullable, isNone, isSome, none, some } from "./option.js";
export { pipe } from "./pipe.js";
export { err, fromThrowable, isErr, isOk, ok } from "./result.js";
export { fromPromise, ResultAsync } from "./result-async.js";
export type {
  Err,
  None,
  Ok,
  OptionMatchers,
  ResultMatchers,
  Some,
} from "./types.js";

/**
 * Either a successful (`Ok`) or failed (`Err`) outcome. Alias of the type
 * from `@zap-studio/monads/types`, re-declared locally so it can share the
 * `Result` name with the namespace object below (type and value identifiers
 * live in separate namespaces in TypeScript).
 */
export type Result<T, E> = ResultType<T, E>;

/**
 * Either a present (`Some`) or absent (`None`) value. Alias of the type
 * from `@zap-studio/monads/types`, re-declared locally so it can share the
 * `Option` name with the namespace object below.
 */
export type Option<T> = OptionType<T>;

/** Shape of the `Result` namespace object below. */
interface ResultNamespace {
  /** See `andThen` in `@zap-studio/monads/result`. */
  andThen: typeof resultAndThen;
  /** See `map` in `@zap-studio/monads/result`. */
  map: typeof resultMap;
  /** See `mapErr` in `@zap-studio/monads/result`. */
  mapErr: typeof resultMapErr;
  /** See `match` in `@zap-studio/monads/result`. */
  match: typeof resultMatch;
  /** See `unwrap` in `@zap-studio/monads/result`. */
  unwrap: typeof resultUnwrap;
  /** See `unwrapOr` in `@zap-studio/monads/result`. */
  unwrapOr: typeof resultUnwrapOr;
  /** See `unwrapOrElse` in `@zap-studio/monads/result`. */
  unwrapOrElse: typeof resultUnwrapOrElse;
}

/** Shape of the `Option` namespace object below. */
interface OptionNamespace {
  /** See `andThen` in `@zap-studio/monads/option`. */
  andThen: typeof optionAndThen;
  /** See `map` in `@zap-studio/monads/option`. */
  map: typeof optionMap;
  /** See `match` in `@zap-studio/monads/option`. */
  match: typeof optionMatch;
  /** See `orElse` in `@zap-studio/monads/option`. */
  orElse: typeof optionOrElse;
  /** See `unwrap` in `@zap-studio/monads/option`. */
  unwrap: typeof optionUnwrap;
  /** See `unwrapOr` in `@zap-studio/monads/option`. */
  unwrapOr: typeof optionUnwrapOr;
  /** See `unwrapOrElse` in `@zap-studio/monads/option`. */
  unwrapOrElse: typeof optionUnwrapOrElse;
}

/**
 * `Result`'s overlapping combinators, grouped under a namespace object to
 * avoid clashing with `Option`'s combinators of the same name.
 */
export const Result: ResultNamespace = {
  andThen: resultAndThen,
  map: resultMap,
  mapErr: resultMapErr,
  match: resultMatch,
  unwrap: resultUnwrap,
  unwrapOr: resultUnwrapOr,
  unwrapOrElse: resultUnwrapOrElse,
};

/**
 * `Option`'s overlapping combinators, grouped under a namespace object to
 * avoid clashing with `Result`'s combinators of the same name.
 */
export const Option: OptionNamespace = {
  andThen: optionAndThen,
  map: optionMap,
  match: optionMatch,
  orElse: optionOrElse,
  unwrap: optionUnwrap,
  unwrapOr: optionUnwrapOr,
  unwrapOrElse: optionUnwrapOrElse,
};
