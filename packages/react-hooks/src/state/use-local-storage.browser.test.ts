import { afterEach, describe, expect, it, vi } from "vitest";

import { act, renderHook } from "../../tests/_react.ts";
import { useLocalStorage } from "./use-local-storage.ts";

afterEach(() => {
  window.localStorage.clear();
});

describe("useLocalStorage", () => {
  it("returns the initial value when nothing is stored", async () => {
    const { result } = await renderHook(() => useLocalStorage("count", 0));

    expect(result.current[0]).toBe(0);
  });

  it("reads an existing value from localStorage on mount", async () => {
    window.localStorage.setItem("count", JSON.stringify(42));

    const { result } = await renderHook(() => useLocalStorage("count", 0));

    expect(result.current[0]).toBe(42);
  });

  it("falls back to the initial value when the stored JSON is malformed", async () => {
    window.localStorage.setItem("count", "{not json");

    const { result } = await renderHook(() => useLocalStorage("count", 0));

    expect(result.current[0]).toBe(0);
  });

  it("writes through to localStorage and updates state", async () => {
    const { result } = await renderHook(() => useLocalStorage("count", 0));

    await act(() => {
      result.current[1](5);
    });

    expect(result.current[0]).toBe(5);
    expect(window.localStorage.getItem("count")).toBe("5");
  });

  it("accepts a functional updater", async () => {
    const { result } = await renderHook(() => useLocalStorage("count", 0));

    await act(() => {
      result.current[1]((prev) => prev + 1);
    });
    await act(() => {
      result.current[1]((prev) => prev + 1);
    });

    expect(result.current[0]).toBe(2);
  });

  it("removes the key and resets to the initial value", async () => {
    const { result } = await renderHook(() => useLocalStorage("count", 0));

    await act(() => {
      result.current[1](5);
    });
    await act(() => {
      result.current[2]();
    });

    expect(result.current[0]).toBe(0);
    expect(window.localStorage.getItem("count")).toBeNull();
  });

  it("syncs when a storage event fires for the same key from another tab", async () => {
    const { result } = await renderHook(() => useLocalStorage("count", 0));

    await act(async () => {
      window.localStorage.setItem("count", JSON.stringify(9));
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: "count",
          newValue: JSON.stringify(9),
          storageArea: window.localStorage,
        }),
      );
    });

    expect(result.current[0]).toBe(9);
  });

  it("resets to the initial value when a storage event clears the key", async () => {
    const { result } = await renderHook(() => useLocalStorage("count", 0));
    await act(() => {
      result.current[1](5);
    });

    await act(async () => {
      window.localStorage.removeItem("count");
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: "count",
          newValue: null,
          storageArea: window.localStorage,
        }),
      );
    });

    expect(result.current[0]).toBe(0);
  });

  it("sets an error when a storage event's newValue fails to parse", async () => {
    const { result } = await renderHook(() => useLocalStorage("count", 0));

    await act(async () => {
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: "count",
          newValue: "not json",
          storageArea: window.localStorage,
        }),
      );
    });

    expect(result.current[3]).toBeInstanceOf(SyntaxError);
  });

  it("ignores storage events for a different key or storage area", async () => {
    const { result } = await renderHook(() => useLocalStorage("count", 0));

    await act(async () => {
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: "other",
          newValue: JSON.stringify(99),
          storageArea: window.localStorage,
        }),
      );
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: "count",
          newValue: JSON.stringify(99),
          storageArea: window.sessionStorage,
        }),
      );
    });

    expect(result.current[0]).toBe(0);
  });

  it("removes the storage listener on unmount", async () => {
    const { unmount } = await renderHook(() => useLocalStorage("count", 0));

    expect(async () => await unmount()).not.toThrow();
  });
});

describe("useLocalStorage error state", () => {
  it("has a null error when nothing has failed", async () => {
    const { result } = await renderHook(() => useLocalStorage("count", 0));

    expect(result.current[3]).toBeNull();
  });

  it("sets an error when writing to localStorage throws", async () => {
    vi.spyOn(window.localStorage, "setItem").mockImplementation(() => {
      throw new DOMException("quota exceeded");
    });
    const { result } = await renderHook(() => useLocalStorage("count", 0));

    await act(() => {
      result.current[1](5);
    });

    expect(result.current[3]).toBeInstanceOf(DOMException);
  });

  it("clears a previous error once a write succeeds", async () => {
    const setItem = vi.spyOn(window.localStorage, "setItem").mockImplementationOnce(() => {
      throw new DOMException("quota exceeded");
    });
    const { result } = await renderHook(() => useLocalStorage("count", 0));

    await act(() => {
      result.current[1](5);
    });
    setItem.mockRestore();
    await act(() => {
      result.current[1](6);
    });

    expect(result.current[3]).toBeNull();
  });

  it("sets an error when removing from localStorage throws", async () => {
    vi.spyOn(window.localStorage, "removeItem").mockImplementation(() => {
      throw new DOMException("removal failed");
    });
    const { result } = await renderHook(() => useLocalStorage("count", 0));

    await act(() => {
      result.current[2]();
    });

    expect(result.current[3]).toBeInstanceOf(DOMException);
  });
});

describe("useLocalStorage initialValue stability", () => {
  it("does not re-add the storage listener for an object literal re-created every render", async () => {
    const addEventListener = vi.spyOn(window, "addEventListener");
    const { rerender } = await renderHook(() => useLocalStorage("filters", { page: 1 }));

    const initialCalls = addEventListener.mock.calls.length;
    await rerender();
    await rerender();

    expect(addEventListener.mock.calls).toHaveLength(initialCalls);
  });

  it("still falls back to the latest initial value when the key is cleared in another tab", async () => {
    const { result } = await renderHook(() => useLocalStorage("filters", { page: 1 }));

    await act(() => {
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: "filters",
          newValue: null,
          storageArea: window.localStorage,
        }),
      );
    });

    expect(result.current[0]).toEqual({ page: 1 });
  });
});
