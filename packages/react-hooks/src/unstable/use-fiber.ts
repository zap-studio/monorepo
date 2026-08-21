import { type RefObject, useRef } from "react";

import { isProductionBuild } from "./_env.ts";
import { findOwnerFiber, readHostFiber, type FiberLike } from "./_fiber.ts";

/** The shape returned by `useFiber`. */
export interface UseFiberResult<T extends Element> {
  fiber: FiberLike | null;
  ref: RefObject<T | null>;
}

/**
 * Returns the nearest Fiber node for a ref'd DOM element — reads the
 * element's private `__reactFiber$<id>` pointer (react-dom's internal
 * DOM-to-Fiber link, no public API), then walks up to the nearest
 * function-component ancestor when one is found, else the host (DOM)
 * fiber itself. `fiber` is `null` until `ref` attaches to a mounted
 * element — like every ref-based hook in this package, it reflects the
 * previous commit, one render behind.
 *
 * No semver guarantee: `__reactFiber$<id>` is private react-dom internals
 * that can change shape across React majors without notice. This hook
 * fails closed — an unrecognized shape yields `fiber: null` rather than
 * throwing — and no-ops in production builds.
 *
 * @example
 * ```tsx
 * const { ref, fiber } = useFiber<HTMLDivElement>();
 * return <div ref={ref}>{typeof fiber?.type === "function" ? fiber.type.name : "?"}</div>;
 * ```
 */
export const useFiber = <T extends Element = HTMLElement>(): UseFiberResult<T> => {
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
