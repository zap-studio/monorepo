import { useCallback, useEffect, useState } from "react";

/**
 * `CookieChangeEvent`, `CookieInit`, `CookieListItem`, and `CookieStore`
 * below are all TypeScript 7's own native DOM types for the Cookie Store
 * API — used bare, ambient, no import needed. Nothing here re-exports them
 * under those names; callers on TypeScript 7 already have them globally.
 */

/**
 * TypeScript 7's DOM lib declares `Window.cookieStore` as always present,
 * but the Cookie Store API only works in Chromium browsers — Safari and
 * Firefox leave it `undefined` at runtime regardless of what the type says.
 * This function's own return type widens back to `CookieStore | undefined`
 * to match that.
 *
 * This function runs on every render, not just inside `useEffect`. During
 * server-side rendering, `window` does not exist at all, so we check for
 * it directly here instead of relying on an effect to skip the server.
 */
const getCookieStore = (): CookieStore | undefined => {
  if (typeof window === "undefined") {
    return undefined;
  }
  return window.cookieStore;
};

/** Options `useCookie`'s `set()` accepts, beyond the cookie's name/value. */
export type SetCookieOptions = Omit<CookieInit, "name" | "value">;

/** The shape returned by `useCookie`. */
export interface UseCookieResult {
  remove: () => Promise<void>;
  set: (value: string, options?: SetCookieOptions) => Promise<void>;
  supported: boolean;
  value: string | undefined;
}

/**
 * Tracks a single cookie's value using the Cookie Store API. This is
 * easier than parsing `document.cookie` yourself. The hook listens for
 * the `change` event, so `value` stays up to date even when the cookie is
 * set or removed by other code, or by a `Set-Cookie` response header —
 * not just by this hook's own `set()`/`remove()`. If the browser doesn't
 * support the Cookie Store API (Safari, Firefox), `supported` is `false`,
 * `value` stays `undefined`, and `set()`/`remove()` do nothing.
 *
 * @example
 * ```tsx
 * const { value, set, remove, supported } = useCookie("theme");
 * if (supported) await set("dark", { path: "/" });
 * ```
 */
export const useCookie = (name: string): UseCookieResult => {
  const [value, setValueState] = useState<string | undefined>(undefined);
  const supported = Boolean(getCookieStore());

  useEffect(() => {
    const store = getCookieStore();
    if (!store) {
      return undefined;
    }

    let cancelled = false;
    const loadInitialValue = async () => {
      const cookie = await store.get(name);
      if (!cancelled) {
        setValueState(cookie?.value);
      }
    };
    void loadInitialValue();

    const handleChange = (event: CookieChangeEvent) => {
      const changed = event.changed.find((cookie) => cookie.name === name);
      if (changed) {
        setValueState(changed.value);
        return;
      }
      if (event.deleted.some((cookie) => cookie.name === name)) {
        setValueState(undefined);
      }
    };
    store.addEventListener("change", handleChange);

    return () => {
      cancelled = true;
      store.removeEventListener("change", handleChange);
    };
  }, [name]);

  const set = useCallback(
    async (nextValue: string, options: SetCookieOptions = {}): Promise<void> => {
      const store = getCookieStore();
      if (!store) {
        return;
      }
      await store.set({ ...options, name, value: nextValue });
    },
    [name],
  );

  const remove = useCallback(async (): Promise<void> => {
    const store = getCookieStore();
    if (!store) {
      return;
    }
    await store.delete(name);
  }, [name]);

  return { remove, set, supported, value };
};
