import { type RefObject, useState } from "react";

import { useIsomorphicLayoutEffect } from "./use-isomorphic-layout-effect.ts";

/**
 * Re-reads `ref.current` after every render and returns it as state, so
 * elements that only mount later (menus, conditionally-rendered video,
 * etc.) are picked up as soon as React commits them. Backs `usePopover`
 * and `usePictureInPicture`, which both need to attach a native listener
 * to a ref'd element once it exists.
 */
export const useTrackedRefElement = <T extends HTMLElement>(ref: RefObject<T | null>): T | null => {
  const [element, setElement] = useState<T | null>(null);
  useIsomorphicLayoutEffect(() => {
    setElement(ref.current);
  });
  return element;
};
