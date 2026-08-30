import { useCallback, useRef, useState, type ProfilerOnRenderCallback } from "react";

import { useIsomorphicLayoutEffect } from "../lifecycle/use-isomorphic-layout-effect.ts";
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

// v8 ignore next -- production builds pick this, and we test that part. But it only runs on a real `<Profiler>` commit, in a real browser, with `NODE_ENV=production`. Tests cannot reach it, because bundlers replace `process.env.NODE_ENV` when this test suite is built.
const noopOnRender: ProfilerOnRenderCallback = () => {};

const NOOP_RESULT: UseRenderDurationResult = {
  last: null,
  onRender: noopOnRender,
  samples: [],
};

/**
 * Wraps React's `<Profiler>` timing as a hook. Pass the returned
 * `onRender` to a `<Profiler>` wrapping the part of the tree you want to
 * measure. `samples` collects each render's timing data (`id`, `phase`,
 * `actualDuration`, `baseDuration`, `startTime`, `commitTime`), keeping
 * only the most recent `limit` entries (default `20`). Records nothing in
 * production builds.
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
  useIsomorphicLayoutEffect(() => {
    limitRef.current = limit;
  });

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
