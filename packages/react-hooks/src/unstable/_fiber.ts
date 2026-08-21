/**
 * Local model of the private react-dom Fiber shape this file's helpers
 * read — no public type exists for it. Shared by `useFiber` and
 * `useRenderReason`; not itself a public hook (see the package's
 * `_internal.ts`-style shared-file convention).
 */
export interface ContextDependency {
  memoizedValue: unknown;
  next: ContextDependency | null;
}

export interface HookNode {
  memoizedState: unknown;
  next: HookNode | null;
  queue: unknown;
}

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
export const getReactFiberKey = (node: Element): string | undefined =>
  Object.keys(node).find((key) => key.startsWith("__reactFiber$"));

/**
 * Reads the Fiber react-dom attaches to a mounted DOM node via its private
 * `__reactFiber$<id>` pointer. Returns `undefined` for a node react-dom
 * never mounted, or where the shape doesn't match what's expected.
 */
/** A DOM node carrying react-dom's private per-instance Fiber pointers, keyed by the pointer's own name (`__reactFiber$<id>`). */
interface FiberBearingElement extends Element {
  [fiberKey: string]: unknown;
}

export const readHostFiber = (node: Element): FiberLike | undefined => {
  const key = getReactFiberKey(node);
  if (!key) {
    return undefined;
  }
  // SAFETY: __reactFiber$<id> is react-dom's private, undocumented DOM-to-Fiber pointer with no public type — this trusts the internal shape react-dom is known to attach as of the currently supported React majors; an unrecognized shape degrades to `undefined`/`unknown` reads at each call site rather than throwing.
  const bag = node as FiberBearingElement;
  // SAFETY: same private, no-public-type pointer as above — the value at this key is whatever react-dom attached, trusted here as the Fiber shape this file models.
  return bag[key] as FiberLike | undefined;
};

/** Walks a host (DOM) Fiber up to the nearest function-component ancestor, or the highest reached ancestor if none is found within the walk bound. */
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

/** Dispatch-capable (`useState`/`useReducer`) hook values in a Fiber's hook list — `useRef`/`useMemo`/`useCallback`/`useEffect` nodes have no `queue` and are skipped. */
export const collectStateHookValues = (head: HookNode | null): unknown[] => {
  const values: unknown[] = [];
  let node = head;
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

/** Value-equality check for two hook/context value snapshots (from `collectStateHookValues`/`collectContextValues`). */
export const arraysDiffer = (a: unknown[], b: unknown[]): boolean =>
  a.length !== b.length || a.some((value, index) => !Object.is(value, b[index]));

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
