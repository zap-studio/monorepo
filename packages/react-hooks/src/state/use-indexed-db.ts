import { useCallback, useEffect, useRef, useState } from "react";

import { isUpdaterFunction } from "./_updater.ts";

const DB_NAME = "zap-studio-react-hooks";
const STORE_NAME = "use-indexed-db";
const DB_VERSION = 1;

/**
 * Fallbacks for the `error` property, which an `IDBRequest`/`IDBTransaction`
 * always populates before firing its `error` event, but types as nullable.
 */
const REQUEST_FAILED = "The IndexedDB request failed.";
const TRANSACTION_FAILED = "The IndexedDB transaction failed.";

const isSupported = (): boolean => typeof indexedDB !== "undefined";

const openDatabase = (): Promise<IDBDatabase> =>
  new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE_NAME)) {
        request.result.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error(REQUEST_FAILED));
  });

const getValue = async <T>(key: string, initialValue: T): Promise<T> => {
  const db = await openDatabase();
  try {
    return await new Promise<T>((resolve, reject) => {
      const request = db.transaction(STORE_NAME, "readonly").objectStore(STORE_NAME).get(key);
      // SAFETY: only this hook writes to this key (through putValue below), so a stored entry is always a T. If there's no entry (undefined), we fall back to initialValue.
      request.onsuccess = () =>
        resolve(request.result === undefined ? initialValue : (request.result as T));
      request.onerror = () => reject(request.error ?? new Error(REQUEST_FAILED));
    });
  } finally {
    db.close();
  }
};

const write = async (mutate: (store: IDBObjectStore) => void): Promise<void> => {
  const db = await openDatabase();
  try {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      mutate(tx.objectStore(STORE_NAME));
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error ?? new Error(TRANSACTION_FAILED));
    });
  } finally {
    db.close();
  }
};

const putValue = <T>(key: string, value: T): Promise<void> =>
  write((store) => {
    store.put(value, key);
  });

const deleteValue = (key: string): Promise<void> =>
  write((store) => {
    store.delete(key);
  });

/** Status reported by `useIndexedDB`. */
export type IndexedDBStatus = "error" | "loading" | "ready";

/** The shape returned by `useIndexedDB`. */
export interface UseIndexedDBResult<T> {
  error: Error | undefined;
  remove: () => Promise<void>;
  setValue: (next: T | ((prev: T) => T)) => Promise<void>;
  status: IndexedDBStatus;
  value: T;
}

/**
 * State synced to IndexedDB under `key`, using a small dedicated object
 * store. This is different from `useLocalStorage`/`useSessionStorage`:
 * those wrap a synchronous API that only stores strings and has a small
 * size limit. This hook supports structured or binary values and much
 * more storage space, but the read/write API is async — `status` tracks
 * the first read (`"loading"` then `"ready"` or `"error"`), and
 * `setValue`/`remove` return promises that resolve once the write is
 * done.
 *
 * @example
 * ```tsx
 * const { value, setValue, status } = useIndexedDB("draft", { title: "", body: "" });
 * if (status === "ready") await setValue((prev) => ({ ...prev, title: "Hello" }));
 * ```
 */
export const useIndexedDB = <T>(key: string, initialValue: T): UseIndexedDBResult<T> => {
  const [value, setValueState] = useState<T>(initialValue);
  const [status, setStatus] = useState<IndexedDBStatus>("loading");
  const [error, setError] = useState<Error | undefined>(undefined);
  const valueRef = useRef(value);
  const initialValueRef = useRef(initialValue);
  useEffect(() => {
    valueRef.current = value;
    initialValueRef.current = initialValue;
  });

  useEffect(() => {
    if (!isSupported()) {
      setStatus("error");
      setError(new Error("IndexedDB is not supported by this browser."));
      return undefined;
    }

    let cancelled = false;
    setStatus("loading");

    const load = async () => {
      try {
        const stored = await getValue(key, initialValueRef.current);
        if (!cancelled) {
          setValueState(stored);
          setStatus("ready");
        }
      } catch (caught) {
        if (!cancelled) {
          setError(caught instanceof Error ? caught : new Error(String(caught)));
          setStatus("error");
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [key]);

  const setValue = useCallback(
    async (next: T | ((prev: T) => T)): Promise<void> => {
      const resolved = isUpdaterFunction(next) ? next(valueRef.current) : next;
      setValueState(resolved);
      try {
        await putValue(key, resolved);
      } catch (caught) {
        setError(caught instanceof Error ? caught : new Error(String(caught)));
        setStatus("error");
      }
    },
    [key],
  );

  const remove = useCallback(async (): Promise<void> => {
    setValueState(initialValueRef.current);
    try {
      await deleteValue(key);
    } catch (caught) {
      setError(caught instanceof Error ? caught : new Error(String(caught)));
      setStatus("error");
    }
  }, [key]);

  return { error, remove, setValue, status, value };
};
