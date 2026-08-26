import { useCallback, useEffect, useState } from "react";

/** Minimal shape of the Cookie Store API's `CookieListItem`. */
export interface CookieListItem {
  readonly domain: string | null;
  readonly expires: number | null;
  readonly name: string;
  readonly path: string;
  readonly sameSite: string;
  readonly value: string;
}

/** Minimal shape of the Cookie Store API's `CookieChangeEvent`. */
export interface CookieChangeEvent extends Event {
  readonly changed: readonly CookieListItem[];
  readonly deleted: readonly CookieListItem[];
}

/** Minimal shape of the Cookie Store API's `CookieInit`, for `useCookie`'s `set()`. */
export interface CookieInit {
  domain?: string;
  expires?: number;
  name: string;
  path?: string;
  sameSite?: "lax" | "none" | "strict";
  value: string;
}

/** Minimal shape of the Cookie Store API's `window.cookieStore`. */
export interface CookieStore extends EventTarget {
  delete(name: string): Promise<void>;
  get(name: string): Promise<CookieListItem | null>;
  set(options: CookieInit): Promise<void>;
}

/**
 * The Cookie Store API only works in Chromium browsers, and not every
 * version of TypeScript's DOM types knows about it. So we define our own
 * small type for it above, with just what this hook needs. Same idea as
 * `navigation/_navigation-api.ts` for the Navigation API.
 *
 * We cast to this local type instead of extending `Window`, so it never
 * conflicts with whatever `Window.cookieStore` typing a given TypeScript
 * version happens to have.
 *
 * This function runs on every render, not just inside `useEffect`. During
 * server-side rendering, `window` does not exist at all, so we check for
 * it directly here instead of relying on an effect to skip the server.
 */
const getCookieStore = (): CookieStore | undefined => {
  if (typeof window === "undefined") {
    return undefined;
  }
  // SAFETY: we read window.cookieStore as optional here, no matter what the DOM types say. This way, a browser that doesn't have it (Safari, Firefox) gives undefined instead of throwing an error.
  return (window as { cookieStore?: CookieStore }).cookieStore;
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

    const handleChange = (event: Event) => {
      // SAFETY: this listener only ever fires for the Cookie Store API's "change" event, which always has the shape of CookieChangeEvent at runtime, even though we define that type ourselves instead of using TypeScript's DOM types.
      const changeEvent = event as CookieChangeEvent;
      const changed = changeEvent.changed.find((cookie) => cookie.name === name);
      if (changed) {
        setValueState(changed.value);
        return;
      }
      if (changeEvent.deleted.some((cookie) => cookie.name === name)) {
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
