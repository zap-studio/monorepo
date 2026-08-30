/** A new value, or a function that derives one from the previous value. Same shape as `useState`'s setter argument. */
export type Updater<TValue, TPrevious = TValue> = TValue | ((previous: TPrevious) => TValue);

/**
 * Narrows an {@link Updater} to its function form.
 *
 * A bare `typeof next === "function"` check does not narrow a union whose
 * members are type parameters, so every call site would otherwise have to
 * assert the function type back. Doing the check through a type predicate
 * keeps the narrowing where the check happens.
 */
export const isUpdaterFunction = <TValue, TPrevious>(
  next: Updater<TValue, TPrevious>,
): next is (previous: TPrevious) => TValue => typeof next === "function";
