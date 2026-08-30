import { useCallback, useRef, useState } from "react";

/** The shape returned by `useQueue`. */
export interface UseQueueResult<T> {
  clear: () => void;
  dequeue: () => T | undefined;
  enqueue: (value: T) => void;
  first: T | undefined;
  last: T | undefined;
  queue: readonly T[];
}

/**
 * First-in-first-out queue state. `dequeue()` removes and returns the
 * front item right away. It reads and writes through a ref that is
 * always kept up to date with the state, instead of using a plain
 * `useState` updater. This way, calling `dequeue()` right after
 * `enqueue()` in the same block of code always sees the item that was
 * just added.
 *
 * @example
 * ```tsx
 * const { enqueue, dequeue, first } = useQueue<string>();
 * enqueue("a");
 * const next = dequeue(); // "a"
 * ```
 */
export const useQueue = <T>(initialValues: readonly T[] = []): UseQueueResult<T> => {
  const [queue, setQueue] = useState<readonly T[]>(initialValues);
  const queueRef = useRef(queue);

  const enqueue = useCallback((value: T) => {
    const next = [...queueRef.current, value];
    queueRef.current = next;
    setQueue(next);
  }, []);

  const dequeue = useCallback((): T | undefined => {
    if (queueRef.current.length === 0) {
      return undefined;
    }
    const [first, ...rest] = queueRef.current;
    queueRef.current = rest;
    setQueue(rest);
    return first;
  }, []);

  const clear = useCallback(() => {
    queueRef.current = [];
    setQueue([]);
  }, []);

  return {
    clear,
    dequeue,
    enqueue,
    first: queue[0],
    last: queue.at(-1),
    queue,
  };
};
