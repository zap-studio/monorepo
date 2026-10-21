/**
 * `derive`: an auto-tracked, cached computed value over one or more stores
 * (or other `derive` values).
 *
 * @module @zap-studio/store/derive
 */

import type { Readable } from "./types.ts";

import { ReactiveNode, track, type Trackable } from "./_reactive.ts";

interface Dependency<T = unknown> {
  readonly getState?: () => T;
  readonly get: () => T;
}

type DepValue<D> = D extends { getState: () => infer T }
  ? T
  : D extends { get: () => infer T }
    ? T
    : never;

type DepValues<Deps extends readonly unknown[]> = {
  [K in keyof Deps]: DepValue<Deps[K]>;
};

const readDep = <T>(dep: Dependency<T>): T => (dep.getState ? dep.getState() : dep.get());

/**
 * Creates a derived, cached value.
 *
 * Dependency tracking is automatic: recompute only happens lazily, on the
 * next `get()`/`subscribe()` access after a value actually *read* during the
 * last computation changes. Reads inside `fn` are tracked wherever they
 * happen — including ones on stores not listed in `deps` — so `deps` only
 * drives argument order/typing, not correctness.
 *
 * @param deps - Stores (or other `derive` values) whose state is passed as
 *   positional arguments to `fn`, in order.
 * @param fn - Computes the derived value from `deps`' current state.
 *
 * @example
 * ```ts
 * import { derive } from "@zap-studio/store";
 *
 * const double = derive([counter], (s) => s.count * 2);
 *
 * double.get();
 * const unsubscribe = double.subscribe((value) => console.log(value));
 * ```
 */
export const derive = <const Deps extends readonly Dependency[], T>(
  deps: Deps,
  fn: (...values: DepValues<Deps>) => T,
): Readable<T> => {
  let node: ReactiveNode<T> | undefined;
  let dirty = true;
  const upstreamUnsubscribes = new Map<Trackable, () => void>();

  const compute = (): ReactiveNode<T> => {
    // SAFETY: `deps` and the parameters of `fn` are always in the same order,
    // with the same length. `readDep` reads the value out of each `Dependency<T>`,
    // one by one, in that same order.
    const { value, deps: discovered } = track(() => fn(...(deps.map(readDep) as DepValues<Deps>)));

    for (const [dep, unsubscribe] of upstreamUnsubscribes) {
      if (!discovered.has(dep)) {
        unsubscribe();
        upstreamUnsubscribes.delete(dep);
      }
    }
    for (const dep of discovered) {
      if (!upstreamUnsubscribes.has(dep)) {
        upstreamUnsubscribes.set(dep, dep.subscribe(onUpstreamChange));
      }
    }

    dirty = false;
    if (node === undefined) {
      node = new ReactiveNode<T>(value);
    } else {
      node.set(value);
    }
    return node;
  };

  const ensureNode = (): ReactiveNode<T> => (dirty || node === undefined ? compute() : node);

  const onUpstreamChange = (): void => {
    /* v8 ignore next -- `node` always has a value here. `onUpstreamChange` can only run after `compute()` has subscribed to a dependency, and `compute()` always sets `node` before it finishes. `?.` and `?? 0` are only here to make TypeScript happy about `node`'s type — they do not check for something that can really happen. */
    if ((node?.listenerCount ?? 0) === 0) {
      dirty = true;
      return;
    }
    compute();
  };

  return {
    get(): T {
      return ensureNode().get();
    },
    subscribe(listener: (value: T) => void): () => void {
      const activeNode = ensureNode();
      const unsubscribe = activeNode.subscribe(() => listener(activeNode.peek()));
      return () => {
        unsubscribe();
        if (activeNode.listenerCount === 0) {
          for (const upstreamUnsubscribe of upstreamUnsubscribes.values()) {
            upstreamUnsubscribe();
          }
          upstreamUnsubscribes.clear();
          dirty = true;
        }
      };
    },
  };
};
