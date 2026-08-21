import { type RefObject, useRef } from "react";

import { isProductionBuild } from "./_env.ts";
import { findOwnerFiber, readHostFiber, type FiberLike } from "./_fiber.ts";

/** The shape returned by `useUnstableFiber`. */
export interface UseUnstableFiberResult<T extends Element> {
  fiber: FiberLike | null;
  ref: RefObject<T | null>;
}

/**
 * Returns the nearest Fiber node for a ref'd DOM element, via react-dom's
 * private `__reactFiber$<id>` DOM pointer — walks up to the nearest
 * function-component ancestor when found, else the host (DOM) fiber
 * itself. `fiber` is `null` until `ref` attaches to a mounted element,
 * and stays `null` (rather than throwing) on an unrecognized internal
 * shape or in production builds.
 *
 * @example
 * ```tsx
 * const { ref, fiber } = useUnstableFiber<HTMLDivElement>();
 * return <div ref={ref}>{typeof fiber?.type === "function" ? fiber.type.name : "?"}</div>;
 * ```
 */
export const useUnstableFiber = <T extends Element = HTMLElement>(): UseUnstableFiberResult<T> => {
  const ref = useRef<T | null>(null);

  if (isProductionBuild()) {
    return { fiber: null, ref };
  }

  const element = ref.current;
  if (!element) {
    return { fiber: null, ref };
  }

  try {
    const hostFiber = readHostFiber(element);
    return { fiber: hostFiber ? findOwnerFiber(hostFiber) : null, ref };
  } catch {
    return { fiber: null, ref };
  }
};
