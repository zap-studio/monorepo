import { useCallback, useRef, useState, type ProfilerOnRenderCallback } from "react";

import { isProductionBuild } from "./_env.ts";

/** One `<Profiler>` `onRender` sample, as recorded by `useUnstableRenderDuration`. */
export interface RenderDurationSample {
  actualDuration: number;
  baseDuration: number;
  commitTime: number;
  id: string;
  phase: "mount" | "nested-update" | "update";
  startTime: number;
}

/** The shape returned by `useUnstableRenderDuration`. */
export interface UseUnstableRenderDurationResult {
  last: RenderDurationSample | null;
  onRender: ProfilerOnRenderCallback;
  samples: RenderDurationSample[];
}

// v8 ignore next -- selected in production builds (tested), but only ever *called* by a real <Profiler> commit, which requires a real browser under NODE_ENV=production — unreachable here since bundlers replace `process.env.NODE_ENV` at this test suite's own build time.
const noopOnRender: ProfilerOnRenderCallback = () => {};

const NOOP_RESULT: UseUnstableRenderDurationResult = {
  last: null,
  onRender: noopOnRender,
  samples: [],
};

/**
 * Wraps React's `<Profiler>` `onRender` timing as a hook — pass `onRender`
 * to a `<Profiler>` wrapping the subtree to measure; `samples` accumulates
 * each render's `{ id, phase, actualDuration, baseDuration, startTime,
 * commitTime }`, capped at the last `limit` (default `20`). Records
 * nothing in production builds.
 *
 * @example
 * ```tsx
 * const { onRender, last } = useUnstableRenderDuration();
 * return (
 *   <Profiler id="Sidebar" onRender={onRender}>
 *     <Sidebar />
 *   </Profiler>
 * );
 * ```
 */
export const useUnstableRenderDuration = (limit = 20): UseUnstableRenderDurationResult => {
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
