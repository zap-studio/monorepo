import { useCallback, useRef, useState, type ProfilerOnRenderCallback } from "react";

import { isProductionBuild } from "./_env.ts";

/** One `<Profiler>` `onRender` sample, as recorded by `useRenderDuration`. */
export interface RenderDurationSample {
  actualDuration: number;
  baseDuration: number;
  commitTime: number;
  id: string;
  phase: "mount" | "nested-update" | "update";
  startTime: number;
}

/** The shape returned by `useRenderDuration`. */
export interface UseRenderDurationResult {
  last: RenderDurationSample | null;
  onRender: ProfilerOnRenderCallback;
  samples: RenderDurationSample[];
}

const NOOP_RESULT: UseRenderDurationResult = { last: null, onRender: () => {}, samples: [] };

/**
 * Wraps React's `<Profiler>` `onRender` timing as a hook — pass `onRender`
 * to a `<Profiler>` wrapping the subtree to measure; `samples` accumulates
 * each render's `{ id, phase, actualDuration, baseDuration, startTime,
 * commitTime }`, capped at the last `limit` (default `20`). Built entirely
 * on the public `<Profiler>` API — no private internals — but still lives
 * under `unstable/` since it's a dev/debug tool, not runtime behavior to
 * depend on: it no-ops (records nothing) in production builds.
 *
 * @example
 * ```tsx
 * const { onRender, last } = useRenderDuration();
 * return (
 *   <Profiler id="Sidebar" onRender={onRender}>
 *     <Sidebar />
 *   </Profiler>
 * );
 * ```
 */
export const useRenderDuration = (limit = 20): UseRenderDurationResult => {
  const [samples, setSamples] = useState<RenderDurationSample[]>([]);
  const limitRef = useRef(limit);
  limitRef.current = limit;

  const onRender = useCallback<ProfilerOnRenderCallback>(
    (id, phase, actualDuration, baseDuration, startTime, commitTime) => {
      setSamples((previous) =>
        [...previous, { actualDuration, baseDuration, commitTime, id, phase, startTime }].slice(
          -limitRef.current,
        ),
      );
    },
    [],
  );

  if (isProductionBuild()) {
    return NOOP_RESULT;
  }

  return { last: samples.at(-1) ?? null, onRender, samples };
};
