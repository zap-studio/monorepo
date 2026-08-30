import { type RefObject, useRef, useState } from "react";

import { useIsomorphicLayoutEffect } from "../lifecycle/use-isomorphic-layout-effect.ts";

/** The shape returned by `useFileDrop`. */
export interface UseFileDropResult<T extends HTMLElement> {
  isOver: boolean;
  ref: RefObject<T | null>;
}

const filesFrom = (event: DragEvent): File[] => [...(event.dataTransfer?.files ?? [])];

/**
 * Tracks drag-and-drop file uploads for one element, using the browser's
 * Drag and Drop API. `isOver` tells you whether a drag is currently over
 * the element. `onDrop` is called with the dropped files as a `File[]`.
 * You don't need to memoize `onDrop` — the hook always calls the latest
 * version you passed in. This hook is also exported as `useDropzone`,
 * which is just another name for the same hook.
 *
 * The listeners attach before the browser paints. This matters because a
 * `drop` event only fires once, so an overlay that appears in the middle
 * of a drag could otherwise miss it. The hook also re-checks `ref` on
 * every render, so it still works if the drop target appears later, is
 * shown conditionally, or gets swapped for a different element.
 *
 * @example
 * ```tsx
 * const { ref, isOver } = useFileDrop<HTMLDivElement>((files) => upload(files));
 * return <div ref={ref}>{isOver ? "Drop to upload" : "Drag files here"}</div>;
 * ```
 */
export const useFileDrop = <T extends HTMLElement = HTMLElement>(
  onDrop: (files: File[]) => void,
): UseFileDropResult<T> => {
  const ref = useRef<T | null>(null);
  const onDropRef = useRef(onDrop);
  useIsomorphicLayoutEffect(() => {
    onDropRef.current = onDrop;
  });
  const [isOver, setIsOver] = useState(false);

  const [element, setElement] = useState<T | null>(null);
  useIsomorphicLayoutEffect(() => {
    setElement(ref.current);
  });

  useIsomorphicLayoutEffect(() => {
    if (!element) {
      return undefined;
    }

    const handleDragOver = (event: DragEvent) => {
      event.preventDefault();
    };
    const handleDragEnter = (event: DragEvent) => {
      event.preventDefault();
      setIsOver(true);
    };
    const handleDragLeave = () => setIsOver(false);
    const handleDrop = (event: DragEvent) => {
      event.preventDefault();
      setIsOver(false);
      onDropRef.current(filesFrom(event));
    };

    element.addEventListener("dragover", handleDragOver);
    element.addEventListener("dragenter", handleDragEnter);
    element.addEventListener("dragleave", handleDragLeave);
    element.addEventListener("drop", handleDrop);
    return () => {
      element.removeEventListener("dragover", handleDragOver);
      element.removeEventListener("dragenter", handleDragEnter);
      element.removeEventListener("dragleave", handleDragLeave);
      element.removeEventListener("drop", handleDrop);
    };
  }, [element]);

  return { isOver, ref };
};

export { useFileDrop as useDropzone };
