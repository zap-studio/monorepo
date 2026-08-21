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
 * The Cookie Store API is Chromium-only and isn't declared in every
 * supported TypeScript version's DOM lib, so its shape (above) is modeled
 * locally, to only what this hook actually reads/calls — same reasoning
 * as `navigation/_navigation-api.ts` for the Navigation API. Cast through
 * a small local shape (rather than an `interface extends Window`) so it
 * can't conflict with whatever `Window.cookieStore` typing a given
 * lib.dom.d.ts snapshot has.
 *
 * Unlike `_navigation-api.ts`'s `getNavigation()`, this is called directly
 * from the hook body on every render (not just from inside `useEffect`),
 * so — since plain `window` isn't just untyped but a genuine
 * `ReferenceError` during SSR — it needs its own `typeof window`
 * guard rather than relying on an effect to keep it client-only.
 */
const getCookieStore = (): CookieStore | undefined => {
  if (typeof window === "undefined") {
    return undefined;
  }
  // SAFETY: window.cookieStore is read as optional here regardless of how (or whether) the resolved TypeScript version's DOM lib declares it, so a browser where it's genuinely absent (Safari, Firefox) degrades to undefined rather than throwing.
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
 * A single cookie's value, via the Cookie Store API — an async
 * alternative to parsing `document.cookie` by hand, with a `change` event
 * this hook subscribes to so `value` stays live even when the cookie is
 * set/removed by other code (or by a `Set-Cookie` response header) rather
 * than this hook's own `set()`/`remove()`. `supported: false` — with
 * `value` staying `undefined` and `set()`/`remove()` no-oping — where the
 * Cookie Store API doesn't exist (Safari, Firefox).
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
      // SAFETY: this listener is only ever registered for the Cookie Store API's "change" event, whose event object is always shaped like CookieChangeEvent at runtime, even though that type is modeled locally rather than pulled from TypeScript's DOM lib.
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
