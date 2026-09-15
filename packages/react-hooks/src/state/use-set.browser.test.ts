import { describe, expect, it } from "vitest";

import { act, renderHook } from "../../tests/_react.ts";
import { useSet } from "./use-set.ts";

describe("useSet", () => {
  it("starts empty by default", async () => {
    const { result } = await renderHook(() => useSet<string>());

    expect(result.current.set.size).toBe(0);
  });

  it("starts populated from initialValues", async () => {
    const { result } = await renderHook(() => useSet<string>(["a", "b"]));

    expect(result.current.set).toEqual(new Set(["a", "b"]));
  });

  it("add() inserts a value and triggers a re-render", async () => {
    const { result } = await renderHook(() => useSet<string>());

    await act(() => {
      result.current.add("a");
    });

    expect(result.current.set.has("a")).toBe(true);
  });

  it("add() of an already-present value is a no-op (same set reference)", async () => {
    const { result } = await renderHook(() => useSet<string>(["a"]));
    const before = result.current.set;

    await act(() => {
      result.current.add("a");
    });

    expect(result.current.set).toBe(before);
  });

  it("has() reads the latest set", async () => {
    const { result } = await renderHook(() => useSet<string>());

    await act(() => {
      result.current.add("a");
    });

    expect(result.current.has("a")).toBe(true);
    expect(result.current.has("b")).toBe(false);
  });

  it("delete() removes a value", async () => {
    const { result } = await renderHook(() => useSet<string>(["a"]));

    await act(() => {
      result.current.delete("a");
    });

    expect(result.current.set.has("a")).toBe(false);
  });

  it("delete() of a missing value is a no-op (same set reference)", async () => {
    const { result } = await renderHook(() => useSet<string>(["a"]));
    const before = result.current.set;

    await act(() => {
      result.current.delete("missing");
    });

    expect(result.current.set).toBe(before);
  });

  it("clear() empties the set", async () => {
    const { result } = await renderHook(() => useSet<string>(["a", "b"]));

    await act(() => {
      result.current.clear();
    });

    expect(result.current.set.size).toBe(0);
  });

  it("clear() on an already-empty set is a no-op (same set reference)", async () => {
    const { result } = await renderHook(() => useSet<string>());
    const before = result.current.set;

    await act(() => {
      result.current.clear();
    });

    expect(result.current.set).toBe(before);
  });
});
