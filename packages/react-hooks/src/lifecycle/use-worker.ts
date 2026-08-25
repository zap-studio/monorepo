import { useCallback, useEffect, useRef } from "react";

/** The shape returned by `useWorker`. */
export interface UseWorkerResult<TMessage, TResult> {
  run: (message: TMessage) => Promise<TResult>;
  supported: boolean;
  terminate: () => void;
}

const isSupported = (): boolean => typeof Worker !== "undefined";

/**
 * Offloads work to a `Worker`, with a promise-based `run()` instead of
 * raw `postMessage`/`onmessage` plumbing. `createWorker` is only called
 * lazily, on the first `run()` — never on mount — and the same worker
 * instance is reused across calls until `terminate()` (or unmount) tears
 * it down, after which the next `run()` creates a fresh one.
 * `supported: false` — the SSR-safe default — where Web Workers don't
 * exist, and `run()` then rejects without ever calling `createWorker`.
 *
 * @example
 * ```tsx
 * const { run } = useWorker<number, number>(() => new Worker(new URL("./sum.worker.ts", import.meta.url)));
 * const total = await run(42);
 * ```
 */
export const useWorker = <TMessage = unknown, TResult = unknown>(
  createWorker: () => Worker,
): UseWorkerResult<TMessage, TResult> => {
  const supported = isSupported();
  const workerRef = useRef<Worker | null>(null);
  const createWorkerRef = useRef(createWorker);
  useEffect(() => {
    createWorkerRef.current = createWorker;
  });

  const terminate = useCallback((): void => {
    workerRef.current?.terminate();
    workerRef.current = null;
  }, []);

  const run = useCallback(
    (message: TMessage): Promise<TResult> =>
      new Promise((resolve, reject) => {
        if (!isSupported()) {
          reject(new Error("Web Workers are not supported by this browser."));
          return;
        }
        workerRef.current ??= createWorkerRef.current();
        const worker = workerRef.current;

        const handleMessage = (event: MessageEvent<TResult>) => {
          worker.removeEventListener("message", handleMessage);
          worker.removeEventListener("error", handleError);
          resolve(event.data);
        };
        const handleError = (event: ErrorEvent) => {
          worker.removeEventListener("message", handleMessage);
          worker.removeEventListener("error", handleError);
          reject(new Error(event.message));
        };

        worker.addEventListener("message", handleMessage);
        worker.addEventListener("error", handleError);
        worker.postMessage(message);
      }),
    [],
  );

  useEffect(() => terminate, [terminate]);

  return { run, supported, terminate };
};
