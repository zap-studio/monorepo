import { afterEach, describe, expect, it, vi } from "vitest";

import { act, renderHook } from "../../tests/_react.ts";
import { useSessionStorage } from "./use-session-storage.ts";

afterEach(() => {
  window.sessionStorage.clear();
});

describe("useSessionStorage", () => {
  it("returns the initial value when nothing is stored", async () => {
    const { result } = await renderHook(() => useSessionStorage("draft", ""));

    expect(result.current[0]).toBe("");
  });

  it("reads an existing value from sessionStorage on mount", async () => {
    window.sessionStorage.setItem("draft", JSON.stringify("hello"));

    const { result } = await renderHook(() => useSessionStorage("draft", ""));

    expect(result.current[0]).toBe("hello");
  });

  it("writes through to sessionStorage and updates state", async () => {
    const { result } = await renderHook(() => useSessionStorage("draft", ""));

    await act(() => {
      result.current[1]("hello");
    });

    expect(result.current[0]).toBe("hello");
    expect(window.sessionStorage.getItem("draft")).toBe('"hello"');
  });

  it("removes the key and resets to the initial value", async () => {
    const { result } = await renderHook(() => useSessionStorage("draft", ""));

    await act(() => {
      result.current[1]("hello");
    });
    await act(() => {
      result.current[2]();
    });

    expect(result.current[0]).toBe("");
    expect(window.sessionStorage.getItem("draft")).toBeNull();
  });

  it("sets an error when writing to sessionStorage throws", async () => {
    vi.spyOn(window.sessionStorage, "setItem").mockImplementation(() => {
      throw new DOMException("quota exceeded");
    });
    const { result } = await renderHook(() => useSessionStorage("draft", ""));

    await act(() => {
      result.current[1]("hello");
    });

    expect(result.current[3]).toBeInstanceOf(DOMException);
  });
});
