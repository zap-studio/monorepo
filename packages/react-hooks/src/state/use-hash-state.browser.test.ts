import { afterEach, describe, expect, it } from "vitest";

import { act, renderHook } from "../../tests/_react.ts";
import { useHashState } from "./use-hash-state.ts";

const NEW_HASH = "#from-setter";

afterEach(() => {
  location.hash = "";
});

describe("useHashState", () => {
  it("reads the current location.hash", async () => {
    location.hash = "#initial";

    const { result } = await renderHook(() => useHashState());

    expect(result.current[0]).toBe("#initial");
  });

  it("updates on hashchange", async () => {
    const { result } = await renderHook(() => useHashState());

    await act(async () => {
      location.hash = "#next";
    });

    expect(result.current[0]).toBe("#next");
  });

  it("setHash() writes location.hash, which flows back through hashchange", async () => {
    const { result } = await renderHook(() => useHashState());

    await act(async () => {
      result.current[1](NEW_HASH);
    });

    expect(result.current[0]).toBe(NEW_HASH);
    expect(location.hash).toBe(NEW_HASH);
  });

  it("setHash() accepts an updater function reading the latest hash", async () => {
    location.hash = "#a";
    const { result } = await renderHook(() => useHashState());

    await act(async () => {
      result.current[1]((prev) => `${prev}-b`);
    });

    expect(result.current[0]).toBe("#a-b");
  });

  it("removes the hashchange listener on unmount", async () => {
    const { result, unmount } = await renderHook(() => useHashState());
    const before = result.current[0];
    await unmount();

    await act(async () => {
      location.hash = "#after-unmount";
    });

    expect(result.current[0]).toBe(before);
  });
});
