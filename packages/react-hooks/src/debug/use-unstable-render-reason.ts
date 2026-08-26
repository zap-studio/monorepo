import { type RefObject, useEffect, useRef, useState } from "react";

import { isProductionBuild } from "./_env.ts";
import {
  arraysDiffer,
  collectContextValues,
  collectStateHookValues,
  findOwnerFiber,
  propsDiffer,
  readHostFiber,
  type FiberLike,
} from "./_fiber.ts";

/** The classification `useUnstableRenderReason` reports. */
export type RenderReason = "context" | "mount" | "parent" | "props" | "state" | "unknown";

/** The shape returned by `useUnstableRenderReason`. */
export interface UseUnstableRenderReasonResult<T extends Element> {
  reason: RenderReason;
  ref: RefObject<T | null>;
}

/** Options accepted by `useUnstableRenderReason`. */
export interface UseUnstableRenderReasonOptions {
  /** How many Fiber ancestors, hooks, and context entries to walk through before giving up. Defaults to `DEFAULT_MAX_WALK` (50). */
  maxWalk?: number;
}

interface RenderSnapshot {
  context: unknown[];
  props: Record<string, unknown> | null;
  state: unknown[];
}

const EMPTY_SNAPSHOT: RenderSnapshot = { context: [], props: null, state: [] };

/**
 * The number of hooks `useUnstableRenderReason` calls internally (4
 * `useRef`s, 1 `useState`, 1 `useEffect`). We skip this many hooks when
 * reading the caller's hook list, so this hook's own `reason` state
 * doesn't get mistaken for one of the caller's own `useState` calls.
 */
const OWN_HOOK_COUNT = 6;

const snapshotOf = (fiber: FiberLike, maxWalk: number | undefined): RenderSnapshot => ({
  context: collectContextValues(fiber, maxWalk),
  props: fiber.memoizedProps,
  state: collectStateHookValues(fiber.memoizedState, OWN_HOOK_COUNT, maxWalk),
});

const classify = (
  hasSeenFiber: boolean,
  current: RenderSnapshot,
  previous: RenderSnapshot,
): RenderReason => {
  if (!hasSeenFiber) {
    return "mount";
  }
  if (propsDiffer(current.props, previous.props)) {
    return "props";
  }
  if (arraysDiffer(current.state, previous.state)) {
    return "state";
  }
  if (arraysDiffer(current.context, previous.context)) {
    return "context";
  }
  return "parent";
};

/**
 * Tells you why the ref'd component just re-rendered. The possible
 * values are:
 * - `"mount"` — this is the first render.
 * - `"props"` — a prop value changed.
 * - `"state"` — a `useState`/`useReducer` value changed.
 * - `"context"` — a value read with `useContext()` changed.
 * - `"parent"` — none of the above changed. The parent re-rendered this
 *   component anyway, usually because it isn't memoized.
 *
 * If more than one thing changed at once, the first match wins, checked
 * in the order above. The starting value is `"unknown"`.
 *
 * `reason` is computed after the render commits, so it updates one
 * render behind the change that caused it, instead of being available in
 * the same render.
 *
 * Call `useUnstableRenderReason()` as the first hook in your component.
 * It counts its own internal hooks so it can skip them when reading your
 * component's hook list. If you call a stateful hook before this one, it
 * will be miscounted as belonging to this hook.
 *
 * `options.maxWalk` caps how many Fiber ancestors, hooks, and context
 * entries get walked while computing the reason. Defaults to 50; pass a
 * higher number for a deeply nested tree, or a lower one to bail out sooner.
 *
 * @example
 * ```tsx
 * const { ref, reason } = useUnstableRenderReason<HTMLDivElement>();
 * return <div ref={ref}>{reason}</div>;
 * ```
 */
export const useUnstableRenderReason = <T extends Element = HTMLElement>(
  options?: UseUnstableRenderReasonOptions,
): UseUnstableRenderReasonResult<T> => {
  const maxWalk = options?.maxWalk;
  const ref = useRef<T | null>(null);
  const hasSeenFiberRef = useRef(false);
  const previousRef = useRef<RenderSnapshot>(EMPTY_SNAPSHOT);
  const skipNextRef = useRef(false);
  const [reason, setReason] = useState<RenderReason>("unknown");

  const computeReason = (): RenderReason => {
    /* v8 ignore next 3 -- computeReason only runs inside the effect below. That effect never runs during server-side rendering, so a Node test can't reach this. We also can't force a production build at test time, since bundlers replace `process.env.NODE_ENV` before this test suite's own build runs. */
    if (isProductionBuild()) {
      return "unknown";
    }
    const element = ref.current;
    if (!element) {
      return "unknown";
    }
    try {
      const hostFiber = readHostFiber(element);
      if (!hostFiber) {
        return "unknown";
      }
      const current = snapshotOf(findOwnerFiber(hostFiber, maxWalk), maxWalk);
      const nextReason = classify(hasSeenFiberRef.current, current, previousRef.current);
      hasSeenFiberRef.current = true;
      previousRef.current = current;
      return nextReason;
    } catch {
      return "unknown";
    }
  };

  useEffect(() => {
    if (skipNextRef.current) {
      skipNextRef.current = false;
      return;
    }

    const nextReason = computeReason();
    // Calling setState only triggers another commit (which we need to skip) when the value actually changes. React silently ignores a setState call with an equal value, so without this check, skipNextRef could get stuck and wrongly skip the next real render.
    if (nextReason !== reason) {
      skipNextRef.current = true;
    }
    setReason(nextReason);
  });

  return { reason, ref };
};
