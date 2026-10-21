/**
 * Public type contracts for `Result`, `ResultAsync`, and `Option`.
 *
 * @module @zap-studio/monads/types
 */

/** A successful `Result`, carrying a value. */
export interface Ok<T> {
  /** Discriminant: always `true` for `Ok`. */
  readonly ok: true;
  /** The successful value. */
  readonly value: T;
}

/** A failed `Result`, carrying an error. */
export interface Err<E> {
  /** Discriminant: always `false` for `Err`. */
  readonly ok: false;
  /** The failure error. */
  readonly error: E;
}

/** Either a successful (`Ok`) or failed (`Err`) outcome. */
export type Result<T, E> = Ok<T> | Err<E>;

/** Matchers for `Result.match(...)`, one branch per `Result` variant. */
export interface ResultMatchers<T, E, U> {
  /** Called with the `Ok` value when the matched `Result` is `Ok`. */
  ok: (value: T) => U;
  /** Called with the `Err` error when the matched `Result` is `Err`. */
  err: (error: E) => U;
}

/** An `Option` holding a value. */
export interface Some<T> {
  /** Discriminant: always `true` for `Some`. */
  readonly some: true;
  /** The held value. */
  readonly value: T;
}

/** An `Option` holding no value. */
export interface None {
  /** Discriminant: always `false` for `None`. */
  readonly some: false;
}

/** Either a present (`Some`) or absent (`None`) value. */
export type Option<T> = Some<T> | None;

/** Matchers for `Option.match(...)`, one branch per `Option` variant. */
export interface OptionMatchers<T, U> {
  /** Called with the held value when the matched `Option` is `Some`. */
  some: (value: T) => U;
  /** Called with no arguments when the matched `Option` is `None`. */
  none: () => U;
}
