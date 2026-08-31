/**
 * `createStore`: a single-factory, framework-agnostic state container with
 * auto-tracked derived values (see `./derive.ts`) and optional built-in
 * persist.
 *
 * @module @zap-studio/store/store
 */

import type { ActionsFactory, GetState, SetState, Store, StoreOptions } from "./types.ts";

import { ReactiveNode } from "./_reactive.ts";

const readPersisted = <S>(options: StoreOptions | undefined, initialState: S): S => {
  const persist = options?.persist;
  if (!persist) {
    return initialState;
  }

  const raw = persist.storage.getItem(persist.key);
  if (raw === null) {
    return initialState;
  }

  try {
    return { ...initialState, ...JSON.parse(raw) };
  } catch {
    return initialState;
  }
};

/**
 * Creates a store with no actions: state only, plus (optionally) persist.
 *
 * @param initialState - The store's initial state.
 * @param actionsFactory - Omitted for this overload.
 * @param options - `persist` to back the state with `localStorage`-shaped storage.
 *
 * @example
 * ```ts
 * import { createStore } from "@zap-studio/store";
 *
 * const counter = createStore({ count: 0 });
 *
 * counter.get(); // { count: 0 }
 * counter.getState(); // { count: 0 }
 * ```
 */
export function createStore<S extends object>(
  initialState: S,
  actionsFactory?: undefined,
  options?: StoreOptions,
): Store<S, Record<string, never>>;

/**
 * Creates a store: state plus actions bound once at creation, not redefined
 * per render/consumer.
 *
 * @param initialState - The store's initial state.
 * @param actionsFactory - Builds actions from `set`/`get`, bound once.
 * @param options - `persist` to back the state with `localStorage`-shaped storage.
 *
 * @example
 * ```ts
 * import { createStore } from "@zap-studio/store";
 *
 * const counter = createStore(
 *   { count: 0 },
 *   (set, get) => ({
 *     increment: () => set((s) => ({ count: s.count + 1 })),
 *   }),
 * );
 *
 * counter.get(); // { count: 0, increment: fn }
 * counter.getState(); // { count: 0 }
 * const unsubscribe = counter.subscribe((state) => console.log(state));
 * ```
 */
export function createStore<S extends object, A extends Record<string, unknown>>(
  initialState: S,
  actionsFactory: ActionsFactory<S, A>,
  options?: StoreOptions,
): Store<S, A>;

export function createStore<S extends object, A extends Record<string, unknown>>(
  initialState: S,
  actionsFactory?: ActionsFactory<S, A>,
  options?: StoreOptions,
): Store<S, A> {
  const node = new ReactiveNode<S>(readPersisted(options, initialState));
  const persist = options?.persist;

  const set: SetState<S> = (updater) => {
    const prev = node.peek();
    const next = { ...prev, ...updater(prev) };
    node.set(next);
    persist?.storage.setItem(persist.key, JSON.stringify(node.peek()));
  };

  const getState: GetState<S> = () => node.peek();

  // SAFETY: the two overloads above make sure `actionsFactory` is either missing
  // or present. If it is missing, `A` is `Record<string, never>`, and `{}` fits
  // that type. If it is present, its return value already matches `A`. This
  // function's own type is wider than both overloads, so TypeScript cannot
  // check this on its own — we check it by hand instead.
  const actions = (actionsFactory?.(set, getState) ?? {}) as A;

  return {
    get: () => ({ ...node.get(), ...actions }),
    getState: () => node.get(),
    subscribe: (listener) => node.subscribe(() => listener({ ...node.peek(), ...actions })),
  };
}
