import { useCallback, useEffect, useRef, useState } from "react";

/** A new value, or an updater deriving one from the previous value — matches `useState`'s setter shape. */
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
    // SAFETY: this hook is the only writer of this key (via JSON.stringify(resolved) below), so a parse here always yields back a T — except when storage was edited externally, which the surrounding try/catch already treats as "fall back to initialValue".
    return item === null ? initialValue : (JSON.parse(item) as T);
  } catch {
    return initialValue;
  }
};

/**
 * Shared `Storage` (localStorage/sessionStorage) sync behind
 * `useLocalStorage` and `useSessionStorage`. Not itself a public hook —
 * hook files never import one another, so shared logic lives here
 * (mirrors `@zap-studio/retry`'s `_otel.ts` convention).
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
      // SAFETY: SetStoredValue<T> = T | ((prev: T) => T); the typeof check above narrows to the function branch, so this cast just recovers the parameter type TS can't infer through a bare `typeof x === "function"` guard on a generic union.
      const resolved = typeof next === "function" ? (next as (prev: T) => T)(value) : next;
      try {
        getStorage().setItem(key, JSON.stringify(resolved));
      } catch {
        // Storage write failed (quota exceeded, private browsing, etc.) — state still updates in-memory.
      }
      setValueState(resolved);
    },
    [key, getStorage, value],
  );

  const remove = useCallback((): void => {
    try {
      getStorage().removeItem(key);
    } catch {
      // Storage removal failed — state still resets in-memory.
    }
    setValueState(initialValueRef.current);
  }, [key, getStorage]);

  useEffect(() => {
    const handleStorageEvent = (event: StorageEvent) => {
      if (event.key !== key || event.storageArea !== getStorage()) {
        return;
      }
      // SAFETY: this StorageEvent is for the exact key this hook owns, and this hook is the only writer of that key, so a non-null newValue always parses back to a T.
      setValueState(
        event.newValue === null ? initialValueRef.current : (JSON.parse(event.newValue) as T),
      );
    };

    window.addEventListener("storage", handleStorageEvent);
    return () => window.removeEventListener("storage", handleStorageEvent);
  }, [key, getStorage]);

  return [value, setValue, remove];
};
