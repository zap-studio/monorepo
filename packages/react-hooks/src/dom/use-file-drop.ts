import { type RefObject, useEffect, useRef, useState } from "react";

/** The shape returned by `useFileDrop`. */
export interface UseFileDropResult<T extends HTMLElement> {
  isOver: boolean;
  ref: RefObject<T | null>;
}

const filesFrom = (event: DragEvent): File[] => [...(event.dataTransfer?.files ?? [])];

/**
 * Drag-and-drop file upload state for a single ref'd drop target, via the
 * HTML Drag and Drop API. `isOver` tracks whether a drag is currently over
 * the element; `onDrop` is called with the dropped `File[]`. `onDrop`
 * doesn't need to be memoized — the latest one is always called. Also
 * exported as `useDropzone`, an alias for the same hook.
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
  useEffect(() => {
    onDropRef.current = onDrop;
  });
  const [isOver, setIsOver] = useState(false);

  useEffect(() => {
    const element = ref.current;
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
  }, []);

  return { isOver, ref };
};

export { useFileDrop as useDropzone };
