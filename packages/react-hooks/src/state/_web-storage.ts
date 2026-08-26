import { useCallback, useEffect, useRef, useState } from "react";

/** A new value, or a function that returns one based on the previous value. Same shape as `useState`'s setter. */
export type SetStoredValue<T> = T | ((prev: T) => T);

/** The tuple returned by `useLocalStorage`/`useSessionStorage`. */
export type WebStorageResult<T> = [
  value: T,
  setValue: (next: SetStoredValue<T>) => void,
  remove: () => void,
];

const readStoredValue = <T>(storage: Storage, key: string, initialValue: T): T => {
  try {
    const item = storage.getItem(key);
    // SAFETY: only this hook writes to this key (see JSON.stringify(resolved) below), so parsing it here always gives back a T. If something outside this hook changes the storage, the try/catch above already falls back to initialValue.
    return item === null ? initialValue : (JSON.parse(item) as T);
  } catch {
    return initialValue;
  }
};

/**
 * Shared logic for syncing state to a `Storage` object (localStorage or
 * sessionStorage), used by `useLocalStorage` and `useSessionStorage`.
 */
export const useWebStorage = <T>(
  getStorage: () => Storage,
  key: string,
  initialValue: T,
): WebStorageResult<T> => {
  const [value, setValueState] = useState<T>(() =>
    typeof window === "undefined" ? initialValue : readStoredValue(getStorage(), key, initialValue),
  );

  const initialValueRef = useRef(initialValue);
  useEffect(() => {
    initialValueRef.current = initialValue;
  });

  const setValue = useCallback(
    (next: SetStoredValue<T>): void => {
      // SAFETY: the typeof check above already confirms `next` is a function here. This cast just restores the type that TypeScript loses when checking `typeof x === "function"` on a generic union.
      const resolved = typeof next === "function" ? (next as (prev: T) => T)(value) : next;
      try {
        getStorage().setItem(key, JSON.stringify(resolved));
      } catch {
        // Storage write failed (for example: quota exceeded, private browsing). The state still updates in memory.
      }
      setValueState(resolved);
    },
    [key, getStorage, value],
  );

  const remove = useCallback((): void => {
    try {
      getStorage().removeItem(key);
    } catch {
      // Storage removal failed. The state still resets in memory.
    }
    setValueState(initialValueRef.current);
  }, [key, getStorage]);

  useEffect(() => {
    const handleStorageEvent = (event: StorageEvent) => {
      if (event.key !== key || event.storageArea !== getStorage()) {
        return;
      }
      // SAFETY: this event is for the exact key this hook manages, and only this hook writes to it. So when newValue is not null, it always parses back into a T.
      setValueState(
        event.newValue === null ? initialValueRef.current : (JSON.parse(event.newValue) as T),
      );
    };

    window.addEventListener("storage", handleStorageEvent);
    return () => window.removeEventListener("storage", handleStorageEvent);
  }, [key, getStorage]);

  return [value, setValue, remove];
};
