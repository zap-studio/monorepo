import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { CookieInit, CookieListItem, CookieStore } from "./use-cookie.ts";

import { useCookie } from "./use-cookie.ts";

// SAFETY: single explicit escape hatch for casting test doubles / deliberately
// non-conforming fixtures to a type they don't structurally satisfy, instead of
// scattering `as unknown as X` chains through the test body.
const asTestDouble = <T>(value: unknown): T => value as T;

const cookieItem = (name: string, value: string): CookieListItem => {
  return { domain: null, expires: null, name, path: "/", sameSite: "lax", value };
};

const createCookieStoreMock = (initial: Record<string, string> = {}) => {
  const target = new EventTarget();
  const cookies = new Map<string, CookieListItem>(
    Object.entries(initial).map(([name, value]) => [name, cookieItem(name, value)]),
  );

  const dispatchChange = (changed: CookieListItem[], deleted: CookieListItem[]) => {
    store.dispatchEvent(Object.assign(new Event("change"), { changed, deleted }));
  };

  // SAFETY: useCookie only ever calls get/set/delete (with these exact signatures) plus addEventListener/removeEventListener on the store; `target` is a real EventTarget so those listener methods work natively, and the assigned delete/get/set mocks below cover the rest of what useCookie reads.
  const store: CookieStore = asTestDouble<CookieStore>(
    Object.assign(target, {
      delete: vi.fn<(name: string) => Promise<void>>((name: string): Promise<void> => {
        const existing = cookies.get(name);
        cookies.delete(name);
        if (existing) {
          dispatchChange([], [existing]);
        }
        return Promise.resolve();
      }),
      get: vi.fn<(name: string) => Promise<CookieListItem | null>>(
        (name: string): Promise<CookieListItem | null> =>
          Promise.resolve(cookies.get(name) ?? null),
      ),
      set: vi.fn<(options: CookieInit) => Promise<void>>((options: CookieInit): Promise<void> => {
        const item = cookieItem(options.name, options.value);
        cookies.set(options.name, item);
        dispatchChange([item], []);
        return Promise.resolve();
      }),
    }),
  );

  return { dispatchChange, store };
};

const setCookieStore = (store: CookieStore | undefined) => {
  Object.defineProperty(window, "cookieStore", {
    configurable: true,
    get: () => store,
  });
};

describe("useCookie", () => {
  it("reports supported: false when the Cookie Store API is unsupported", () => {
    setCookieStore(undefined);

    const { result } = renderHook(() => useCookie("theme"));

    expect(result.current.supported).toBe(false);
    expect(result.current.value).toBeUndefined();
  });

  it("reads the initial cookie value", async () => {
    setCookieStore(createCookieStoreMock({ theme: "dark" }).store);

    const { result } = renderHook(() => useCookie("theme"));

    await waitFor(() => expect(result.current.value).toBe("dark"));
    expect(result.current.supported).toBe(true);
  });

  it("reports undefined when the cookie doesn't exist", async () => {
    setCookieStore(createCookieStoreMock().store);

    const { result } = renderHook(() => useCookie("missing"));

    await waitFor(() => expect(result.current.supported).toBe(true));
    expect(result.current.value).toBeUndefined();
  });

  it("set() writes the cookie and updates value via the change event", async () => {
    const { store } = createCookieStoreMock();
    setCookieStore(store);

    const { result } = renderHook(() => useCookie("theme"));
    await waitFor(() => expect(result.current.supported).toBe(true));

    await act(async () => {
      await result.current.set("dark", { path: "/" });
    });

    expect(store.set).toHaveBeenCalledWith({ name: "theme", path: "/", value: "dark" });
    expect(result.current.value).toBe("dark");
  });

  it("remove() deletes the cookie and clears value via the change event", async () => {
    const { store } = createCookieStoreMock({ theme: "dark" });
    setCookieStore(store);

    const { result } = renderHook(() => useCookie("theme"));
    await waitFor(() => expect(result.current.value).toBe("dark"));

    await act(async () => {
      await result.current.remove();
    });

    expect(store.delete).toHaveBeenCalledWith("theme");
    expect(result.current.value).toBeUndefined();
  });

  it("ignores change events for other cookie names", async () => {
    const { dispatchChange, store } = createCookieStoreMock({ theme: "dark" });
    setCookieStore(store);

    const { result } = renderHook(() => useCookie("theme"));
    await waitFor(() => expect(result.current.value).toBe("dark"));

    await act(async () => {
      dispatchChange([cookieItem("other", "x")], []);
    });

    expect(result.current.value).toBe("dark");
  });

  it("set()/remove() no-op when unsupported", async () => {
    setCookieStore(undefined);

    const { result } = renderHook(() => useCookie("theme"));

    await act(async () => {
      await result.current.set("dark");
      await result.current.remove();
    });

    expect(result.current.value).toBeUndefined();
  });

  it("ignores the initial get() result if unmounted before it resolves", async () => {
    let resolveGet: (item: CookieListItem | null) => void = () => {};
    // SAFETY: this test unmounts before its single `store.get(name)` call resolves and never calls set()/remove(), so `delete`/`set` only need to type-check as CookieStore methods; `get` and the real EventTarget it's assigned onto (for useCookie's addEventListener/removeEventListener) are the only members actually exercised.
    const store: CookieStore = asTestDouble<CookieStore>(
      Object.assign(new EventTarget(), {
        delete: vi.fn<(...args: any[]) => any>(),
        get: vi.fn<() => Promise<CookieListItem | null>>(
          () =>
            new Promise<CookieListItem | null>((resolve) => {
              resolveGet = resolve;
            }),
        ),
        set: vi.fn<(...args: any[]) => any>(),
      }),
    );
    setCookieStore(store);

    const { unmount } = renderHook(() => useCookie("theme"));
    unmount();
    resolveGet(cookieItem("theme", "dark"));

    await act(async () => {
      await Promise.resolve();
    });
  });

  it("removes the change listener on unmount", async () => {
    const { dispatchChange, store } = createCookieStoreMock({ theme: "dark" });
    setCookieStore(store);

    const { result, unmount } = renderHook(() => useCookie("theme"));
    await waitFor(() => expect(result.current.value).toBe("dark"));
    unmount();

    await act(async () => {
      dispatchChange([], [cookieItem("theme", "dark")]);
    });

    expect(result.current.value).toBe("dark");
  });
});
