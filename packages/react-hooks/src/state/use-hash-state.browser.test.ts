import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { useHashState } from "./use-hash-state.ts";

afterEach(() => {
  location.hash = "";
});

describe(useHashState, () => {
  it("reads the current location.hash", () => {
    location.hash = "#initial";

    const { result } = renderHook(() => useHashState());

    expect(result.current[0]).toBe("#initial");
  });

  it("updates on hashchange", async () => {
    const { result } = renderHook(() => useHashState());

    await act(async () => {
      location.hash = "#next";
    });

    expect(result.current[0]).toBe("#next");
  });

  it("setHash() writes location.hash, which flows back through hashchange", async () => {
    const { result } = renderHook(() => useHashState());

    await act(async () => {
      result.current[1]("#from-setter");
    });

    expect(result.current[0]).toBe("#from-setter");
    expect(location.hash).toBe("#from-setter");
  });

  it("setHash() accepts an updater function reading the latest hash", async () => {
    location.hash = "#a";
    const { result } = renderHook(() => useHashState());

    await act(async () => {
      result.current[1]((prev) => `${prev}-b`);
    });

    expect(result.current[0]).toBe("#a-b");
  });

  it("removes the hashchange listener on unmount", async () => {
    const { result, unmount } = renderHook(() => useHashState());
    const before = result.current[0];
    unmount();

    await act(async () => {
      location.hash = "#after-unmount";
    });

    expect(result.current[0]).toBe(before);
  });
});
