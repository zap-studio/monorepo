import { useCallback, useEffect, useRef, useState } from "react";

import { useIsomorphicLayoutEffect } from "../lifecycle/use-isomorphic-layout-effect.ts";
import { isUpdaterFunction } from "./_updater.ts";

/** A new value, or a function that returns one based on the previous value. Same shape as `useState`'s setter. */
export type SetStoredValue<T> = T | ((prev: T) => T);

/** The tuple returned by `useLocalStorage`/`useSessionStorage`. */
export type WebStorageResult<T> = [
  value: T,
  setValue: (next: SetStoredValue<T>) => void,
  remove: () => void,
  error: unknown,
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
  const [error, setError] = useState<unknown>(null);

  const initialValueRef = useRef(initialValue);
  useIsomorphicLayoutEffect(() => {
    initialValueRef.current = initialValue;
  });

  const setValue = useCallback(
    (next: SetStoredValue<T>): void => {
      const resolved = isUpdaterFunction(next) ? next(value) : next;
      try {
        getStorage().setItem(key, JSON.stringify(resolved));
        setError(null);
      } catch (writeError) {
        setError(writeError);
      }
      setValueState(resolved);
    },
    [key, getStorage, value],
  );

  const remove = useCallback((): void => {
    try {
      getStorage().removeItem(key);
      setError(null);
    } catch (removeError) {
      setError(removeError);
    }
    setValueState(initialValueRef.current);
  }, [key, getStorage]);

  useEffect(() => {
    const handleStorageEvent = (event: StorageEvent) => {
      if (event.key !== key || event.storageArea !== getStorage()) {
        return;
      }
      try {
        // SAFETY: this event is for the exact key this hook manages, and only this hook writes to it. So when newValue is not null, it always parses back into a T.
        setValueState(
          event.newValue === null ? initialValueRef.current : (JSON.parse(event.newValue) as T),
        );
        setError(null);
      } catch (parseError) {
        setError(parseError);
      }
    };

    window.addEventListener("storage", handleStorageEvent);
    return () => window.removeEventListener("storage", handleStorageEvent);
  }, [key, getStorage]);

  return [value, setValue, remove, error];
};
