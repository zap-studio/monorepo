import { describe, expect, it } from "vitest";

import { act, renderHook } from "../../tests/_react.ts";
import { useMap } from "./use-map.ts";

describe("useMap", () => {
  it("starts empty by default", async () => {
    const { result } = await renderHook(() => useMap<string, number>());

    expect(result.current.map.size).toBe(0);
  });

  it("starts populated from initialEntries", async () => {
    const { result } = await renderHook(() =>
      useMap<string, number>([
        ["a", 1],
        ["b", 2],
      ]),
    );

    expect(result.current.map).toEqual(
      new Map([
        ["a", 1],
        ["b", 2],
      ]),
    );
  });

  it("set() adds/updates an entry and triggers a re-render", async () => {
    const { result } = await renderHook(() => useMap<string, number>());

    await act(() => {
      result.current.set("a", 1);
    });

    expect(result.current.map.get("a")).toBe(1);

    await act(() => {
      result.current.set("a", 2);
    });

    expect(result.current.map.get("a")).toBe(2);
  });

  it("get()/has() read the latest map", async () => {
    const { result } = await renderHook(() => useMap<string, number>());

    await act(() => {
      result.current.set("a", 1);
    });

    expect(result.current.get("a")).toBe(1);
    expect(result.current.has("a")).toBe(true);
    expect(result.current.has("b")).toBe(false);
  });

  it("delete() removes an entry", async () => {
    const { result } = await renderHook(() => useMap<string, number>([["a", 1]]));

    await act(() => {
      result.current.delete("a");
    });

    expect(result.current.map.has("a")).toBe(false);
  });

  it("delete() on a missing key is a no-op (same map reference)", async () => {
    const { result } = await renderHook(() => useMap<string, number>([["a", 1]]));
    const before = result.current.map;

    await act(() => {
      result.current.delete("missing");
    });

    expect(result.current.map).toBe(before);
  });

  it("clear() empties the map", async () => {
    const { result } = await renderHook(() =>
      useMap<string, number>([
        ["a", 1],
        ["b", 2],
      ]),
    );

    await act(() => {
      result.current.clear();
    });

    expect(result.current.map.size).toBe(0);
  });

  it("clear() on an already-empty map is a no-op (same map reference)", async () => {
    const { result } = await renderHook(() => useMap<string, number>());
    const before = result.current.map;

    await act(() => {
      result.current.clear();
    });

    expect(result.current.map).toBe(before);
  });
});
