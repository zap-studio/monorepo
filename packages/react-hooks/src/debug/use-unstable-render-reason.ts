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

interface RenderSnapshot {
  context: unknown[];
  props: Record<string, unknown> | null;
  state: unknown[];
}

const EMPTY_SNAPSHOT: RenderSnapshot = { context: [], props: null, state: [] };

/**
 * How many hooks `useUnstableRenderReason` itself calls (4 `useRef`s, 1
 * `useState`, 1 `useEffect`) — skipped when walking the caller's hook
 * list so this hook's own `reason` state doesn't show up as if it were
 * the caller's own `useState`.
 */
const OWN_HOOK_COUNT = 6;

const snapshotOf = (fiber: FiberLike): RenderSnapshot => ({
  context: collectContextValues(fiber),
  props: fiber.memoizedProps,
  state: collectStateHookValues(fiber.memoizedState, OWN_HOOK_COUNT),
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
 * Classifies why the ref'd component just re-rendered — `"mount"`,
 * `"props"`, `"state"` (a `useState`/`useReducer` value changed),
 * `"context"` (a read `useContext()` value changed), or `"parent"` (none
 * of the above changed, so the parent re-rendered this component without a
 * locally-observable cause — typically a non-memoized child). When more
 * than one changed at once, the first match wins, checked in that order.
 * `"unknown"` is the starting value.
 *
 * Computed in an effect, after commit, so `reason` updates one render
 * behind the change that caused it rather than being available
 * synchronously in the same render.
 *
 * Call `useUnstableRenderReason()` as the first hook in the component —
 * state detection skips this hook's own internal hooks by count when
 * walking the Fiber hook list, so a stateful hook called *before* it
 * would be miscounted as this hook's own.
 *
 * @example
 * ```tsx
 * const { ref, reason } = useUnstableRenderReason<HTMLDivElement>();
 * return <div ref={ref}>{reason}</div>;
 * ```
 */
export const useUnstableRenderReason = <
  T extends Element = HTMLElement,
>(): UseUnstableRenderReasonResult<T> => {
  const ref = useRef<T | null>(null);
  const hasSeenFiberRef = useRef(false);
  const previousRef = useRef<RenderSnapshot>(EMPTY_SNAPSHOT);
  const skipNextRef = useRef(false);
  const [reason, setReason] = useState<RenderReason>("unknown");

  const computeReason = (): RenderReason => {
    /* v8 ignore next 3 -- computeReason only runs inside the effect below, which never runs during SSR (so a Node test can't reach this) and can't be forced into a production build at test time (bundlers replace `process.env.NODE_ENV` at build time, before this browser test suite's own build). */
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
      const current = snapshotOf(findOwnerFiber(hostFiber));
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
    // A setState call only triggers (and thus needs skipping) another commit when the value actually changes — Object.is-equal updates are bailed out of silently, so skipNextRef would otherwise go stale and wrongly skip the next real render.
    if (nextReason !== reason) {
      skipNextRef.current = true;
    }
    setReason(nextReason);
  });

  return { reason, ref };
};
