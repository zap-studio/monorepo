import { useCallback, useEffect, useRef, useState } from "react";

const DB_NAME = "zap-studio-react-hooks";
const STORE_NAME = "use-indexed-db";
const DB_VERSION = 1;

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
    // SAFETY: per the IndexedDB spec, an IDBRequest's `error` is always populated by the time its `error` event fires, so this is never null in practice.
    request.onerror = () => reject(request.error);
  });

const getValue = async <T>(key: string, initialValue: T): Promise<T> => {
  const db = await openDatabase();
  try {
    return await new Promise<T>((resolve, reject) => {
      const request = db.transaction(STORE_NAME, "readonly").objectStore(STORE_NAME).get(key);
      // SAFETY: this hook is the only writer of this key (via putValue below), so a stored entry always round-trips back to a T; an absent entry (undefined) falls back to initialValue.
      request.onsuccess = () =>
        resolve(request.result === undefined ? initialValue : (request.result as T));
      // SAFETY: see openDatabase — an IDBRequest's `error` is always populated when its `error` event fires.
      request.onerror = () => reject(request.error);
    });
  } finally {
    db.close();
  }
};

const putValue = async <T>(key: string, value: T): Promise<void> => {
  const db = await openDatabase();
  try {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      tx.objectStore(STORE_NAME).put(value, key);
      tx.oncomplete = () => resolve();
      // SAFETY: see openDatabase — an IDBTransaction's `error` is always populated when its `error` event fires.
      tx.onerror = () => reject(tx.error);
    });
  } finally {
    db.close();
  }
};

const deleteValue = async (key: string): Promise<void> => {
  const db = await openDatabase();
  try {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      tx.objectStore(STORE_NAME).delete(key);
      tx.oncomplete = () => resolve();
      // SAFETY: see openDatabase — an IDBTransaction's `error` is always populated when its `error` event fires.
      tx.onerror = () => reject(tx.error);
    });
  } finally {
    db.close();
  }
};

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
 * State synced to IndexedDB under `key`, via a small dedicated
 * object store. Distinct from `useLocalStorage`/`useSessionStorage`:
 * those wrap a synchronous, string-only, size-limited API, while this
 * hook supports structured/binary values and much larger storage quotas
 * at the cost of an async read/write API — `status` tracks the initial
 * read (`"loading"` → `"ready"`/`"error"`), and `setValue`/`remove`
 * return promises that resolve once the write completes.
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
  valueRef.current = value;
  const initialValueRef = useRef(initialValue);
  initialValueRef.current = initialValue;

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
      // SAFETY: T | ((prev: T) => T); the typeof check above narrows to the function branch, so this cast just recovers the parameter type TS can't infer through a bare `typeof x === "function"` guard on a generic union.
      const resolved =
        typeof next === "function" ? (next as (prev: T) => T)(valueRef.current) : next;
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
