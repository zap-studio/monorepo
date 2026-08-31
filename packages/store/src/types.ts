/**
 * Public type contracts for @zap-studio/store.
 *
 * @module @zap-studio/store/types
 */

/**
 * Minimal storage contract `persist` needs — satisfied by `localStorage` and
 * `sessionStorage` with zero adapter code.
 */
export interface StorageLike {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
}

/**
 * Persist configuration for `createStore`.
 *
 * Only plain state is persisted — actions (functions) are never serialized.
 */
export interface PersistOptions {
  /** Storage key the serialized state is read from and written to. */
  readonly key: string;
  /** Anything satisfying `getItem`/`setItem`/`removeItem`, e.g. `localStorage`. */
  readonly storage: StorageLike;
}

/** Options accepted by `createStore`. */
export interface StoreOptions {
  readonly persist?: PersistOptions;
}

/**
 * Updater-only setter: always receives the previous state and returns a
 * partial (or full) state, shallow-merged into the store. There is no
 * bare-object `set({ ... })` overload — this removes the merge-vs-replace
 * ambiguity while staying a one-liner for simple updates.
 */
export type SetState<S> = (updater: (prev: S) => Partial<S> | S) => void;

/** Reads the current state without subscribing to it. */
export type GetState<S> = () => S;

/** Factory that builds a store's actions, bound once at creation. */
export type ActionsFactory<S, A extends Record<string, unknown>> = (
  set: SetState<S>,
  get: GetState<S>,
) => A;

/** Instance returned by `createStore`. */
export interface Store<S, A extends Record<string, unknown> = Record<string, never>> {
  /** Returns state and actions merged. */
  get: () => S & A;
  /** Returns state only, no actions. */
  getState: () => S;
  /** Subscribes to every change; returns a plain unsubscribe function. */
  subscribe: (listener: (value: S & A) => void) => () => void;
}

/** Common read surface shared by `Store` and `derive`'s return value. */
export interface Readable<T> {
  get: () => T;
  subscribe: (listener: (value: T) => void) => () => void;
}
