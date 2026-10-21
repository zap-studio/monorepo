/**
 * Internal signal-like reactive core shared by `createStore` and `derive`.
 *
 * Not part of the public API. `track()` records every `ReactiveNode.get()`
 * call made during its callback — including ones made indirectly through a
 * nested `track()` call — which is what lets `derive` auto-discover its real
 * dependencies instead of trusting a caller-supplied list.
 *
 * @module @zap-studio/store/_reactive
 */

type Listener = () => void;

/**
 * What `track()` needs from a dependency: only `subscribe`.
 */
export interface Trackable {
  subscribe: (listener: Listener) => () => void;
}

let activeTracker: Set<Trackable> | null = null;

export class ReactiveNode<T> {
  #value: T;
  #listeners = new Set<Listener>();

  constructor(initial: T) {
    this.#value = initial;
  }

  /** Reads the value without registering it as a dependency. */
  peek(): T {
    return this.#value;
  }

  /** Reads the value, registering it as a dependency of the active `track()` call, if any. */
  get(): T {
    activeTracker?.add(this);
    return this.#value;
  }

  /** Sets the value and notifies subscribers, unless the reference is unchanged. */
  set(next: T): void {
    if (Object.is(next, this.#value)) {
      return;
    }
    this.#value = next;
    for (const listener of this.#listeners) {
      listener();
    }
  }

  subscribe(listener: Listener): () => void {
    this.#listeners.add(listener);
    return () => {
      this.#listeners.delete(listener);
    };
  }

  get listenerCount(): number {
    return this.#listeners.size;
  }
}

/** Result of `track()`: the callback's return value plus what it read. */
export interface TrackResult<T> {
  readonly value: T;
  readonly deps: Set<Trackable>;
}

/**
 * Runs `fn` while recording every `ReactiveNode.get()` call made inside it.
 */
export const track = <T>(fn: () => T): TrackResult<T> => {
  const previous = activeTracker;
  const deps = new Set<Trackable>();
  activeTracker = deps;
  try {
    return { deps, value: fn() };
  } finally {
    activeTracker = previous;
  }
};
