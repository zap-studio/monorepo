import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { useSessionStorage } from "./use-session-storage.ts";

afterEach(() => {
  window.sessionStorage.clear();
});

describe(useSessionStorage, () => {
  it("returns the initial value when nothing is stored", () => {
    const { result } = renderHook(() => useSessionStorage("draft", ""));

    expect(result.current[0]).toBe("");
  });

  it("reads an existing value from sessionStorage on mount", () => {
    window.sessionStorage.setItem("draft", JSON.stringify("hello"));

    const { result } = renderHook(() => useSessionStorage("draft", ""));

    expect(result.current[0]).toBe("hello");
  });

  it("writes through to sessionStorage and updates state", () => {
    const { result } = renderHook(() => useSessionStorage("draft", ""));

    act(() => {
      result.current[1]("hello");
    });

    expect(result.current[0]).toBe("hello");
    expect(window.sessionStorage.getItem("draft")).toBe('"hello"');
  });

  it("removes the key and resets to the initial value", () => {
    const { result } = renderHook(() => useSessionStorage("draft", ""));

    act(() => {
      result.current[1]("hello");
    });
    act(() => {
      result.current[2]();
    });

    expect(result.current[0]).toBe("");
    expect(window.sessionStorage.getItem("draft")).toBeNull();
  });
});
