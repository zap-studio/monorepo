import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { CookieInit, CookieListItem, CookieStore } from "./use-cookie.ts";

import { useCookie } from "./use-cookie.ts";

function cookieItem(name: string, value: string): CookieListItem {
  return { domain: null, expires: null, name, path: "/", sameSite: "lax", value };
}

function createCookieStoreMock(initial: Record<string, string> = {}) {
  const target = new EventTarget();
  const cookies = new Map<string, CookieListItem>(
    Object.entries(initial).map(([name, value]) => [name, cookieItem(name, value)]),
  );

  const dispatchChange = (changed: CookieListItem[], deleted: CookieListItem[]) => {
    store.dispatchEvent(Object.assign(new Event("change"), { changed, deleted }));
  };

  const store: CookieStore = Object.assign(target, {
    delete: vi.fn((name: string): Promise<void> => {
      const existing = cookies.get(name);
      cookies.delete(name);
      if (existing) {
        dispatchChange([], [existing]);
      }
      return Promise.resolve();
    }),
    get: vi.fn((name: string): Promise<CookieListItem | null> =>
      Promise.resolve(cookies.get(name) ?? null),
    ),
    set: vi.fn((options: CookieInit): Promise<void> => {
      const item = cookieItem(options.name, options.value);
      cookies.set(options.name, item);
      dispatchChange([item], []);
      return Promise.resolve();
    }),
  }) as unknown as CookieStore;

  return { dispatchChange, store };
}

function setCookieStore(store: CookieStore | undefined) {
  Object.defineProperty(window, "cookieStore", {
    configurable: true,
    get: () => store,
  });
}

describe(useCookie, () => {
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
    const store: CookieStore = Object.assign(new EventTarget(), {
      delete: vi.fn(),
      get: vi.fn(
        () =>
          new Promise<CookieListItem | null>((resolve) => {
            resolveGet = resolve;
          }),
      ),
      set: vi.fn(),
    }) as unknown as CookieStore;
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
