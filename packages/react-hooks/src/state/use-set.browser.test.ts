import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useSet } from "./use-set.ts";

describe(useSet, () => {
  it("starts empty by default", () => {
    const { result } = renderHook(() => useSet<string>());

    expect(result.current.set.size).toBe(0);
  });

  it("starts populated from initialValues", () => {
    const { result } = renderHook(() => useSet<string>(["a", "b"]));

    expect(result.current.set).toEqual(new Set(["a", "b"]));
  });

  it("add() inserts a value and triggers a re-render", () => {
    const { result } = renderHook(() => useSet<string>());

    act(() => {
      result.current.add("a");
    });

    expect(result.current.set.has("a")).toBe(true);
  });

  it("add() of an already-present value is a no-op (same set reference)", () => {
    const { result } = renderHook(() => useSet<string>(["a"]));
    const before = result.current.set;

    act(() => {
      result.current.add("a");
    });

    expect(result.current.set).toBe(before);
  });

  it("has() reads the latest set", () => {
    const { result } = renderHook(() => useSet<string>());

    act(() => {
      result.current.add("a");
    });

    expect(result.current.has("a")).toBe(true);
    expect(result.current.has("b")).toBe(false);
  });

  it("delete() removes a value", () => {
    const { result } = renderHook(() => useSet<string>(["a"]));

    act(() => {
      result.current.delete("a");
    });

    expect(result.current.set.has("a")).toBe(false);
  });

  it("delete() of a missing value is a no-op (same set reference)", () => {
    const { result } = renderHook(() => useSet<string>(["a"]));
    const before = result.current.set;

    act(() => {
      result.current.delete("missing");
    });

    expect(result.current.set).toBe(before);
  });

  it("clear() empties the set", () => {
    const { result } = renderHook(() => useSet<string>(["a", "b"]));

    act(() => {
      result.current.clear();
    });

    expect(result.current.set.size).toBe(0);
  });

  it("clear() on an already-empty set is a no-op (same set reference)", () => {
    const { result } = renderHook(() => useSet<string>());
    const before = result.current.set;

    act(() => {
      result.current.clear();
    });

    expect(result.current.set).toBe(before);
  });
});
