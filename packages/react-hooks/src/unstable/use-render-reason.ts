import { type RefObject, useRef } from "react";

import { isProductionBuild } from "./_env.ts";
import {
  arraysDiffer,
  collectContextValues,
  collectStateHookValues,
  findOwnerFiber,
  propsDiffer,
  readHostFiber,
} from "./_fiber.ts";

/** The classification `useRenderReason` reports. */
export type RenderReason = "context" | "mount" | "parent" | "props" | "state" | "unknown";

/** The shape returned by `useRenderReason`. */
export interface UseRenderReasonResult<T extends Element> {
  reason: RenderReason;
  ref: RefObject<T | null>;
}

/**
 * Classifies why the ref'd component just re-rendered — `"mount"` (the
 * first render where a Fiber can be read — see the one-render-behind note
 * below), `"props"`, `"state"` (a `useState`/`useReducer` value changed),
 * `"context"` (a read `useContext()` value changed), or `"parent"` (none
 * of the above changed, so the parent re-rendered this component without a
 * locally-observable cause — typically a non-memoized child). When more
 * than one changed at once, the first match wins, checked in that order.
 * `"unknown"` covers an unrecognized internal shape or no Fiber yet.
 *
 * Like every ref-based hook in this package, this reads `ref`'s DOM node
 * one render behind — the ref only attaches during its own commit. Rather
 * than lean on react-dom's own `alternate` pairing (whose props/state
 * aren't guaranteed settled mid-render), this hook keeps its own
 * props/state/context snapshot from the last time it read a Fiber, and
 * compares against that — reliable regardless of exactly when react-dom
 * finishes updating a Fiber's fields relative to this hook's read.
 *
 * Built on the same private, no-semver-guarantee react-dom internals as
 * `useFiber` (see its docs) — fails closed to `"unknown"` rather than
 * throwing, and no-ops (always `"unknown"`) in production builds.
 *
 * @example
 * ```tsx
 * const { ref, reason } = useRenderReason<HTMLDivElement>();
 * return <div ref={ref}>{reason}</div>;
 * ```
 */
export const useRenderReason = <T extends Element = HTMLElement>(): UseRenderReasonResult<T> => {
  const ref = useRef<T | null>(null);
  const hasSeenFiberRef = useRef(false);
  const previousPropsRef = useRef<Record<string, unknown> | null>(null);
  const previousStateRef = useRef<unknown[]>([]);
  const previousContextRef = useRef<unknown[]>([]);

  if (isProductionBuild()) {
    return { reason: "unknown", ref };
  }

  const element = ref.current;
  if (!element) {
    return { reason: "unknown", ref };
  }

  try {
    const hostFiber = readHostFiber(element);
    if (!hostFiber) {
      return { reason: "unknown", ref };
    }
    const fiber = findOwnerFiber(hostFiber);
    const currentProps = fiber.memoizedProps;
    const currentState = collectStateHookValues(fiber.memoizedState);
    const currentContext = collectContextValues(fiber);

    let reason: RenderReason;
    if (!hasSeenFiberRef.current) {
      reason = "mount";
    } else if (propsDiffer(currentProps, previousPropsRef.current)) {
      reason = "props";
    } else if (arraysDiffer(currentState, previousStateRef.current)) {
      reason = "state";
    } else if (arraysDiffer(currentContext, previousContextRef.current)) {
      reason = "context";
    } else {
      reason = "parent";
    }

    hasSeenFiberRef.current = true;
    previousPropsRef.current = currentProps;
    previousStateRef.current = currentState;
    previousContextRef.current = currentContext;

    return { reason, ref };
  } catch {
    return { reason: "unknown", ref };
  }
};
