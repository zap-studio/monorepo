/**
 * `Option<T>` — an explicit, type-safe alternative to `null`/`undefined`
 * checks.
 *
 * An `Option` is either `Some<T>` (a present value) or `None` (absence).
 * Combinators are standalone, curried functions meant to be composed with
 * `pipe` from `@zap-studio/monads/pipe` rather than chained as methods.
 * Types live in `@zap-studio/monads/types`.
 *
 * @module @zap-studio/monads/option
 */

import type { None, Option, OptionMatchers, Some } from "./types.js";

/**
 * Wraps a value in `Some`.
 *
 * @example
 * ```ts
 * const option = some(42); // Some<number>
 * ```
 */
export const some = <T>(value: T): Some<T> => ({ some: true, value });

/** The `None` value, representing absence. */
export const none = (): None => ({ some: false });

/** Type guard: `true` when `option` is `Some`. */
export const isSome = <T>(option: Option<T>): option is Some<T> => option.some;

/** Type guard: `true` when `option` is `None`. */
export const isNone = <T>(option: Option<T>): option is None => !option.some;

/**
 * Transforms the value inside a `Some`, passing `None` through unchanged.
 *
 * @example
 * ```ts
 * pipe(some(2), map((n) => n * 2)); // Some(4)
 * ```
 */
export const map =
  <T, U>(fn: (value: T) => U): ((option: Option<T>) => Option<U>) =>
  (option: Option<T>): Option<U> =>
    isSome(option) ? some(fn(option.value)) : option;

/**
 * Chains an `Option`-returning function onto a `Some`, flattening the
 * result. `None` passes through unchanged. Also known as `flatMap`/`chain`.
 *
 * @example
 * ```ts
 * const half = (n: number): Option<number> =>
 *   n % 2 === 0 ? some(n / 2) : none();
 *
 * pipe(some(4), andThen(half)); // Some(2)
 * ```
 */
export const andThen =
  <T, U>(fn: (value: T) => Option<U>): ((option: Option<T>) => Option<U>) =>
  (option: Option<T>): Option<U> =>
    isSome(option) ? fn(option.value) : option;

/**
 * Recovers from a `None` by computing a fallback `Option`. A `Some` passes
 * through unchanged. Mirrors Rust's `Option::or_else`.
 *
 * @example
 * ```ts
 * pipe(none(), orElse(() => some(0))); // Some(0)
 * pipe(some(1), orElse(() => some(0))); // Some(1), fn not called
 * ```
 */
export const orElse =
  <T>(fn: () => Option<T>): ((option: Option<T>) => Option<T>) =>
  (option: Option<T>): Option<T> =>
    isSome(option) ? option : fn();

/**
 * Extracts the `Some` value, or returns `defaultValue` for `None`.
 *
 * @example
 * ```ts
 * pipe(none(), unwrapOr(0)); // 0
 * ```
 */
export const unwrapOr =
  <T>(defaultValue: T): ((option: Option<T>) => T) =>
  (option: Option<T>): T =>
    isSome(option) ? option.value : defaultValue;

/**
 * Extracts the `Some` value, or computes a fallback.
 *
 * @example
 * ```ts
 * pipe(none(), unwrapOrElse(() => 0)); // 0
 * ```
 */
export const unwrapOrElse =
  <T>(fn: () => T): ((option: Option<T>) => T) =>
  (option: Option<T>): T =>
    isSome(option) ? option.value : fn();

/**
 * Extracts the `Some` value, or throws for `None`.
 *
 * Mirrors Rust's `Option::unwrap`. Prefer `match`, `unwrapOr`, or
 * `unwrapOrElse` for control flow that shouldn't throw.
 *
 * @throws {Error} When `option` is `None`.
 *
 * @example
 * ```ts
 * unwrap(some(42)); // 42
 * unwrap(none()); // throws
 * ```
 */
export const unwrap = <T>(option: Option<T>): T => {
  if (isSome(option)) {
    return option.value;
  }

  throw new Error("Called unwrap() on a None value");
};

/**
 * Exhaustively folds an `Option` into a single value.
 *
 * @example
 * ```ts
 * pipe(
 *   some(42),
 *   match({ some: (n) => `got ${n}`, none: () => "nothing" })
 * ); // "got 42"
 * ```
 */
export const match =
  <T, U>(matchers: OptionMatchers<T, U>): ((option: Option<T>) => U) =>
  (option: Option<T>): U =>
    isSome(option) ? matchers.some(option.value) : matchers.none();

/**
 * Bridges a nullable value into an `Option`: `Some` for anything other than
 * `null`/`undefined`, `None` otherwise.
 *
 * @example
 * ```ts
 * fromNullable([1, 2, 3].find((n) => n > 5)); // None
 * fromNullable([1, 2, 3].find((n) => n > 1)); // Some(2)
 * ```
 */
export const fromNullable = <T>(value: T | null | undefined): Option<NonNullable<T>> => {
  if (value === null || value === undefined) {
    return none();
  }

  // SAFETY: The null/undefined branch above already returned, so `value` is narrowed to `NonNullable<T>` here.
  return some(value as NonNullable<T>);
};
