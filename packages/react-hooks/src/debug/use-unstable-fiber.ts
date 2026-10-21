import { type RefObject, useRef, useState } from "react";

import { useIsomorphicLayoutEffect } from "../lifecycle/use-isomorphic-layout-effect.ts";
import { isProductionBuild } from "./_env.ts";
import { findOwnerFiber, readHostFiber, type FiberLike } from "./_fiber.ts";

/** Options accepted by `useUnstableFiber`. */
export interface UseUnstableFiberOptions {
  /** How many ancestors to walk up while looking for a function component, before giving up. Defaults to `DEFAULT_MAX_WALK` (50). */
  maxWalk?: number;
}

/** The shape returned by `useUnstableFiber`. */
export interface UseUnstableFiberResult<T extends Element> {
  fiber: FiberLike | null;
  ref: RefObject<T | null>;
}

/**
 * Returns the nearest Fiber node for a DOM element you attach `ref` to.
 * It reads React's private `__reactFiber$<id>` pointer, then walks up to
 * the nearest function-component ancestor (or returns the DOM Fiber
 * itself if none is found within `options.maxWalk` steps, default 50).
 *
 * `fiber` is `null` until `ref` attaches to a mounted element. It also
 * stays `null` instead of throwing if the internal shape is unexpected,
 * or in production builds. Attaching the ref triggers a re-render, so
 * `fiber` becomes available right after mount.
 *
 * @example
 * ```tsx
 * const { ref, fiber } = useUnstableFiber<HTMLDivElement>();
 * return <div ref={ref}>{typeof fiber?.type === "function" ? fiber.type.name : "?"}</div>;
 * ```
 */
export const useUnstableFiber = <T extends Element = HTMLElement>(
  options?: UseUnstableFiberOptions,
): UseUnstableFiberResult<T> => {
  const ref = useRef<T | null>(null);

  const [element, setElement] = useState<T | null>(null);
  useIsomorphicLayoutEffect(() => {
    setElement(ref.current);
  });

  if (isProductionBuild()) {
    return { fiber: null, ref };
  }

  if (!element) {
    return { fiber: null, ref };
  }

  try {
    const hostFiber = readHostFiber(element);
    return { fiber: hostFiber ? findOwnerFiber(hostFiber, options?.maxWalk) : null, ref };
  } catch {
    return { fiber: null, ref };
  }
};
