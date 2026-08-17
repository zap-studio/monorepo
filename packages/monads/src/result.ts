/**
 * `Result<T, E>` — an explicit, type-safe alternative to throw/catch.
 *
 * A `Result` is either `Ok<T>` (success, carrying a value) or `Err<E>`
 * (failure, carrying an error). Combinators are standalone, curried
 * functions meant to be composed with `pipe` from `@zap-studio/monads/pipe`
 * rather than chained as methods. Types live in `@zap-studio/monads/types`.
 *
 * @module @zap-studio/monads/result
 */

import type { Err, Ok, Result, ResultMatchers } from "./types.js";

/**
 * Wraps a value in a successful `Result`.
 *
 * @example
 * ```ts
 * const result = ok(42); // Ok<number>
 * ```
 */
export const ok = <T>(value: T): Ok<T> => ({ ok: true, value });

/**
 * Wraps a value in a failed `Result`.
 *
 * @example
 * ```ts
 * const result = err("not found"); // Err<string>
 * ```
 */
export const err = <E>(error: E): Err<E> => ({ error, ok: false });

/** Type guard: `true` when `result` is `Ok`. */
export const isOk = <T, E>(result: Result<T, E>): result is Ok<T> => result.ok;

/** Type guard: `true` when `result` is `Err`. */
export const isErr = <T, E>(result: Result<T, E>): result is Err<E> =>
  !result.ok;

/**
 * Transforms the value inside an `Ok`, passing `Err` through unchanged.
 *
 * @example
 * ```ts
 * pipe(ok(2), map((n) => n * 2)); // Ok(4)
 * ```
 */
export const map =
  <T, U>(fn: (value: T) => U): (<E>(result: Result<T, E>) => Result<U, E>) =>
  <E>(result: Result<T, E>): Result<U, E> =>
    isOk(result) ? ok(fn(result.value)) : result;

/**
 * Transforms the error inside an `Err`, passing `Ok` through unchanged.
 *
 * @example
 * ```ts
 * pipe(err("bad"), mapErr((msg) => new Error(msg)));
 * ```
 */
export const mapErr =
  <E, F>(fn: (error: E) => F): (<T>(result: Result<T, E>) => Result<T, F>) =>
  <T>(result: Result<T, E>): Result<T, F> =>
    isErr(result) ? err(fn(result.error)) : result;

/**
 * Chains a `Result`-returning function onto an `Ok`, flattening the result.
 * `Err` passes through unchanged. Also known as `flatMap`/`chain`.
 *
 * @example
 * ```ts
 * const parse = (s: string): Result<number, string> =>
 *   Number.isNaN(Number(s)) ? err("not a number") : ok(Number(s));
 *
 * pipe(ok("42"), andThen(parse)); // Ok(42)
 * ```
 */
export const andThen =
  <T, U, E>(
    fn: (value: T) => Result<U, E>
  ): ((result: Result<T, E>) => Result<U, E>) =>
  (result: Result<T, E>): Result<U, E> =>
    isOk(result) ? fn(result.value) : result;

/**
 * Recovers from an `Err` by computing a fallback `Result`. An `Ok` passes
 * through unchanged. Mirrors Rust's `Result::or_else`.
 *
 * @example
 * ```ts
 * pipe(err("bad"), orElse((e) => ok(e.length))); // Ok(3)
 * pipe(ok(1), orElse((e) => ok(0))); // Ok(1), fn not called
 * ```
 */
export const orElse =
  <T, E, F>(
    fn: (error: E) => Result<T, F>
  ): ((result: Result<T, E>) => Result<T, F>) =>
  (result: Result<T, E>): Result<T, F> =>
    isErr(result) ? fn(result.error) : result;

/**
 * Extracts the `Ok` value, or returns `defaultValue` for `Err`.
 *
 * @example
 * ```ts
 * pipe(err("bad"), unwrapOr(0)); // 0
 * ```
 */
export const unwrapOr =
  <T>(defaultValue: T): (<E>(result: Result<T, E>) => T) =>
  <E>(result: Result<T, E>): T =>
    isOk(result) ? result.value : defaultValue;

/**
 * Extracts the `Ok` value, or computes a fallback from the `Err` error.
 *
 * @example
 * ```ts
 * pipe(err("bad"), unwrapOrElse((e) => e.length)); // 3
 * ```
 */
export const unwrapOrElse =
  <T, E>(fn: (error: E) => T): ((result: Result<T, E>) => T) =>
  (result: Result<T, E>): T =>
    isOk(result) ? result.value : fn(result.error);

/**
 * Extracts the `Ok` value, or throws for `Err`.
 *
 * Mirrors Rust's `Result::unwrap`. Prefer `match`, `unwrapOr`, or
 * `unwrapOrElse` for control flow that shouldn't throw.
 *
 * @throws {Error} When `result` is `Err`. The original error is attached as
 *   `cause`.
 *
 * @example
 * ```ts
 * unwrap(ok(42)); // 42
 * unwrap(err("bad")); // throws
 * ```
 */
export const unwrap = <T, E>(result: Result<T, E>): T => {
  if (isOk(result)) {
    return result.value;
  }

  throw new Error("Called unwrap() on an Err value", { cause: result.error });
};

/**
 * Exhaustively folds a `Result` into a single value.
 *
 * @example
 * ```ts
 * pipe(
 *   ok(42),
 *   match({ ok: (n) => `got ${n}`, err: (e) => `failed: ${e}` })
 * ); // "got 42"
 * ```
 */
export const match =
  <T, E, U>(matchers: ResultMatchers<T, E, U>): ((result: Result<T, E>) => U) =>
  (result: Result<T, E>): U =>
    isOk(result) ? matchers.ok(result.value) : matchers.err(result.error);

/**
 * Wraps a synchronous, potentially throwing function so it returns a
 * `Result` instead of throwing. The caught value is used as the `Err`
 * error, typed as `unknown`.
 *
 * @param fn - The function to wrap.
 *
 * @example
 * ```ts
 * const safeParse = fromThrowable(JSON.parse);
 *
 * safeParse('{"a":1}'); // Ok({ a: 1 })
 * safeParse("not json"); // Err(SyntaxError: Unexpected token ...)
 * ```
 */
export function fromThrowable<Args extends unknown[], T>(
  fn: (...args: Args) => T
): (...args: Args) => Result<T, unknown>;
/**
 * Wraps a synchronous, potentially throwing function so it returns a
 * `Result` instead of throwing, mapping the caught value into `E`.
 *
 * @param fn - The function to wrap.
 * @param mapError - Transforms a caught value into `E`.
 *
 * @example
 * ```ts
 * const safeParse = fromThrowable(
 *   JSON.parse,
 *   (error) => (error instanceof Error ? error.message : "parse failed")
 * );
 *
 * safeParse('{"a":1}'); // Ok({ a: 1 })
 * safeParse("not json"); // Err("Unexpected token ...")
 * ```
 */
export function fromThrowable<Args extends unknown[], T, E>(
  fn: (...args: Args) => T,
  mapError: (error: unknown) => E
): (...args: Args) => Result<T, E>;
export function fromThrowable<Args extends unknown[], T, E>(
  fn: (...args: Args) => T,
  mapError?: (error: unknown) => E
): (...args: Args) => Result<T, unknown> {
  return (...args: Args): Result<T, unknown> => {
    try {
      return ok(fn(...args));
    } catch (error) {
      return mapError ? err(mapError(error)) : err(error);
    }
  };
}
