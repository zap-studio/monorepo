/**
 * `ResultAsync<T, E>` — a thenable wrapper around `Promise<Result<T, E>>`.
 *
 * Unlike `Result`/`Option`, `ResultAsync` is a class: it must implement
 * `PromiseLike` so it can be awaited directly, and its combinators are
 * instance methods so async chains can be built before the final `await`.
 * `Result`/`Option` intentionally avoid this shape — see
 * `@zap-studio/monads/result` and `@zap-studio/monads/option`. Types live in
 * `@zap-studio/monads/types`.
 *
 * @module @zap-studio/monads/result-async
 */

import {
  err as resultErr,
  isErr,
  map as resultMap,
  mapErr as resultMapErr,
  match as resultMatch,
  ok as resultOk,
} from "./result.js";
import type { Result, ResultMatchers } from "./types.js";

/** A `Promise<Result<T, E>>` wrapper with chainable, async-aware combinators. */
export class ResultAsync<T, E> implements PromiseLike<Result<T, E>> {
  /** The wrapped promise, resolving to a `Result<T, E>`. */
  private readonly promise: Promise<Result<T, E>>;

  /**
   * Wraps an existing `Promise<Result<T, E>>`.
   *
   * Prefer `fromPromise` when wrapping a `Promise<T>` that may reject,
   * rather than one that already resolves to a `Result`.
   */
  constructor(promise: Promise<Result<T, E>>) {
    this.promise = promise;
  }

  /**
   * Implements `PromiseLike<Result<T, E>>`, so a `ResultAsync` can be
   * `await`ed directly instead of via an explicit `.match(...)` call.
   *
   * @param onfulfilled - Called with the resolved `Result<T, E>`.
   * @param onrejected - Called if the underlying promise rejects.
   */
  // oxlint-disable-next-line unicorn/no-thenable -- ResultAsync is designed to be thenable, so `await resultAsync` resolves to the wrapped Result directly; see the class doc.
  then<TResult1 = Result<T, E>, TResult2 = never>(
    onfulfilled?:
      | ((value: Result<T, E>) => PromiseLike<TResult1> | TResult1)
      | null,
    onrejected?: ((reason: unknown) => PromiseLike<TResult2> | TResult2) | null
  ): PromiseLike<TResult1 | TResult2> {
    return this.promise.then(onfulfilled, onrejected);
  }

  /**
   * Transforms the value inside an eventual `Ok`, passing an eventual `Err`
   * through unchanged. See `map` in `@zap-studio/monads/result`.
   */
  map<U>(fn: (value: T) => U): ResultAsync<U, E> {
    return new ResultAsync(
      (async (): Promise<Result<U, E>> => resultMap(fn)(await this.promise))()
    );
  }

  /**
   * Transforms the error inside an eventual `Err`, passing an eventual `Ok`
   * through unchanged. See `mapErr` in `@zap-studio/monads/result`.
   */
  mapErr<F>(fn: (error: E) => F): ResultAsync<T, F> {
    return new ResultAsync(
      (async (): Promise<Result<T, F>> =>
        resultMapErr(fn)(await this.promise))()
    );
  }

  /**
   * Chains a function onto an eventual `Ok`'s value. The function may
   * return a `Result`, a `Promise<Result>`, or another `ResultAsync` — all
   * three are awaited uniformly. `Err` passes through unchanged.
   *
   * @param fn - Receives the `Ok` value, returns the next step.
   */
  andThen<U>(
    fn: (value: T) => Result<U, E> | ResultAsync<U, E> | Promise<Result<U, E>>
  ): ResultAsync<U, E> {
    return new ResultAsync(
      (async (): Promise<Result<U, E>> => {
        const result = await this.promise;

        if (isErr(result)) {
          return result;
        }

        return await fn(result.value);
      })()
    );
  }

  /**
   * Exhaustively folds the eventual `Result` into a single value.
   *
   * @param matchers - `ok`/`err` branches, one of which is called with the
   *   resolved `Result`'s payload.
   */
  async match<U>(matchers: ResultMatchers<T, E, U>): Promise<U> {
    const result = await this.promise;
    return resultMatch(matchers)(result);
  }
}

/**
 * Wraps a rejecting `Promise` into a `ResultAsync`.
 *
 * @param promise - The promise to wrap.
 * @param mapError - Transforms a rejection reason into `E`.
 *
 * @example
 * ```ts
 * const user = fromPromise(
 *   fetch("/api/user").then((r) => r.json()),
 *   (error) => `request failed: ${String(error)}`
 * );
 *
 * const message = await user.match({
 *   ok: (u) => `Hello, ${u.name}`,
 *   err: (reason) => reason,
 * });
 * ```
 */
export const fromPromise = <T, E>(
  promise: Promise<T>,
  mapError: (error: unknown) => E
): ResultAsync<T, E> =>
  new ResultAsync(
    (async (): Promise<Result<T, E>> => {
      try {
        return resultOk(await promise);
      } catch (error) {
        return resultErr(mapError(error));
      }
    })()
  );
