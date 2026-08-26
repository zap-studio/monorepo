/**
 * A simplified copy of React's internal "Fiber" shape, used only by the
 * helpers in this file. React does not publish an official type for
 * this, so we define our own here. Shared by `useUnstableFiber` and
 * `useUnstableRenderReason`.
 */
export interface ContextDependency {
  memoizedValue: unknown;
  next: ContextDependency | null;
}

/** One entry in a Fiber's list of hooks. Each hook call gets one entry, in the order the hooks were called. */
export interface HookNode {
  memoizedState: unknown;
  next: HookNode | null;
  queue: unknown;
}

/** The Fiber fields this file's helpers read. */
export interface FiberLike {
  alternate: FiberLike | null;
  dependencies: { firstContext: ContextDependency | null } | null;
  memoizedProps: Record<string, unknown> | null;
  memoizedState: HookNode | null;
  return: FiberLike | null;
  type: unknown;
}

const MAX_WALK = 50;

/** Finds the DOM node's private `__reactFiber$<id>` property key, if any. */
const getReactFiberKey = (node: Element): string | undefined =>
  Object.keys(node).find((key) => key.startsWith("__reactFiber$"));

/** A DOM node that has React's private Fiber pointer attached, under a key like `__reactFiber$<id>`. */
interface FiberBearingElement extends Element {
  [fiberKey: string]: unknown;
}

/**
 * Gets the internal Fiber object React attaches to a mounted DOM node.
 * Returns `undefined` if React never mounted this node.
 */
export const readHostFiber = (node: Element): FiberLike | undefined => {
  const key = getReactFiberKey(node);
  if (!key) {
    return undefined;
  }
  // SAFETY: `__reactFiber$<id>` is React's private, undocumented pointer from a DOM node to its Fiber. It has no public type. We trust the shape React is known to use in the versions this package supports. If the shape turns out different, callers just get `undefined`/`unknown` values instead of a crash.
  const bag = node as FiberBearingElement;
  // SAFETY: same private pointer as above. We trust that the value React attached here matches the Fiber shape defined in this file.
  return bag[key] as FiberLike | undefined;
};

/** Walks up from a DOM Fiber to find the nearest ancestor that is a function component. If none is found within the walk limit, returns the highest ancestor reached. */
export const findOwnerFiber = (hostFiber: FiberLike): FiberLike => {
  let current: FiberLike | null = hostFiber;
  let last = hostFiber;
  for (let i = 0; i < MAX_WALK && current; i += 1) {
    if (typeof current.type === "function") {
      return current;
    }
    last = current;
    current = current.return;
  }
  return last;
};

/**
 * Collects the current values of `useState`/`useReducer` hooks from a
 * Fiber's hook list. Hooks like `useRef`/`useMemo`/`useCallback`/
 * `useEffect` have no `queue`, so they are skipped.
 *
 * `skip` removes the first N hooks from the list before collecting,
 * counting every hook, not just state hooks. Use this when a hook reads
 * its own caller's Fiber: set `skip` to the number of hooks this hook
 * itself calls, so its own state doesn't get mixed in with the caller's.
 */
export const collectStateHookValues = (head: HookNode | null, skip = 0): unknown[] => {
  const values: unknown[] = [];
  let node = head;
  for (let i = 0; i < skip && node; i += 1) {
    node = node.next;
  }
  for (let i = 0; i < MAX_WALK && node; i += 1) {
    if (node.queue) {
      values.push(node.memoizedState);
    }
    node = node.next;
  }
  return values;
};

/** `useContext()` values read by a Fiber, via its `dependencies.firstContext` list. */
export const collectContextValues = (fiber: FiberLike): unknown[] => {
  const values: unknown[] = [];
  let node = fiber.dependencies?.firstContext ?? null;
  for (let i = 0; i < MAX_WALK && node; i += 1) {
    values.push(node.memoizedValue);
    node = node.next;
  }
  return values;
};

/** Compares two value snapshots (from `collectStateHookValues`/`collectContextValues`) and returns `true` if they differ. */
export const arraysDiffer = (a: unknown[], b: unknown[]): boolean =>
  a.length !== b.length || a.some((value, index) => !Object.is(value, b[index]));

/** Compares two props objects key by key and returns `true` if they differ. Used with consecutive `memoizedProps` reads. */
export const propsDiffer = (
  a: Record<string, unknown> | null,
  b: Record<string, unknown> | null,
): boolean => {
  if (a === b) {
    return false;
  }
  if (!a || !b) {
    return true;
  }
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  for (const key of keys) {
    if (!Object.is(a[key], b[key])) {
      return true;
    }
  }
  return false;
};
