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
 * FIFO queue state. `dequeue()` both removes and returns the front item
 * synchronously — reading/writing through a ref kept in lockstep with
 * state, rather than a plain `useState` updater, so a `dequeue()` right
 * after an `enqueue()` in the same synchronous block always sees the
 * item that was just enqueued.
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
