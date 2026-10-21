import { useCallback, useEffect, useRef } from "react";

/** The shape returned by `useWorker`. */
export interface UseWorkerResult<TMessage, TResult> {
  run: (message: TMessage) => Promise<TResult>;
  supported: boolean;
  terminate: () => void;
}

const isSupported = (): boolean => typeof Worker !== "undefined";

/**
 * Sends work to a `Worker` (a background thread), using a promise-based
 * `run()` function instead of raw `postMessage`/`onmessage` code.
 * `createWorker` is only called the first time you call `run()`, never on
 * mount. The same worker is reused for every call, until `terminate()` is
 * called (or the component unmounts). After that, the next `run()` call
 * creates a new worker.
 * Returns `supported: false` when Web Workers don't exist, such as during
 * server rendering. In that case, `run()` rejects without ever calling
 * `createWorker`.
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
