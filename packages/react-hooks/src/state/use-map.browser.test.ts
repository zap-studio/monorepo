import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useMap } from "./use-map.ts";

describe(useMap, () => {
  it("starts empty by default", () => {
    const { result } = renderHook(() => useMap<string, number>());

    expect(result.current.map.size).toBe(0);
  });

  it("starts populated from initialEntries", () => {
    const { result } = renderHook(() =>
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

  it("set() adds/updates an entry and triggers a re-render", () => {
    const { result } = renderHook(() => useMap<string, number>());

    act(() => {
      result.current.set("a", 1);
    });

    expect(result.current.map.get("a")).toBe(1);

    act(() => {
      result.current.set("a", 2);
    });

    expect(result.current.map.get("a")).toBe(2);
  });

  it("get()/has() read the latest map", () => {
    const { result } = renderHook(() => useMap<string, number>());

    act(() => {
      result.current.set("a", 1);
    });

    expect(result.current.get("a")).toBe(1);
    expect(result.current.has("a")).toBe(true);
    expect(result.current.has("b")).toBe(false);
  });

  it("delete() removes an entry", () => {
    const { result } = renderHook(() => useMap<string, number>([["a", 1]]));

    act(() => {
      result.current.delete("a");
    });

    expect(result.current.map.has("a")).toBe(false);
  });

  it("delete() on a missing key is a no-op (same map reference)", () => {
    const { result } = renderHook(() => useMap<string, number>([["a", 1]]));
    const before = result.current.map;

    act(() => {
      result.current.delete("missing");
    });

    expect(result.current.map).toBe(before);
  });

  it("clear() empties the map", () => {
    const { result } = renderHook(() =>
      useMap<string, number>([
        ["a", 1],
        ["b", 2],
      ]),
    );

    act(() => {
      result.current.clear();
    });

    expect(result.current.map.size).toBe(0);
  });

  it("clear() on an already-empty map is a no-op (same map reference)", () => {
    const { result } = renderHook(() => useMap<string, number>());
    const before = result.current.map;

    act(() => {
      result.current.clear();
    });

    expect(result.current.map).toBe(before);
  });
});
