import { afterEach, describe, expect, it } from "vitest";

import { act, renderHook } from "../../tests/_react.ts";
import { usePopState } from "./use-pop-state.ts";

afterEach(() => {
  window.history.replaceState(null, "", "/");
});

describe("usePopState", () => {
  it("reports the current location.pathname and history.state", async () => {
    window.history.pushState({ from: "test" }, "", "/initial");

    const { result } = await renderHook(() => usePopState());

    expect(result.current).toEqual({ pathname: "/initial", state: { from: "test" } });
  });

  it("updates on popstate", async () => {
    const { result } = await renderHook(() => usePopState());

    await act(async () => {
      window.history.pushState({ page: 2 }, "", "/next");
      window.dispatchEvent(new PopStateEvent("popstate", { state: { page: 2 } }));
    });

    expect(result.current).toEqual({ pathname: "/next", state: { page: 2 } });
  });

  it("returns the same reference when pathname and state are unchanged", async () => {
    window.history.pushState({ page: 1 }, "", "/same");
    const { result } = await renderHook(() => usePopState());
    const first = result.current;

    await act(async () => {
      window.dispatchEvent(new PopStateEvent("popstate", { state: { page: 1 } }));
    });

    expect(result.current.pathname).toBe("/same");
    expect(result.current).toBe(first);
  });

  it("removes the popstate listener on unmount", async () => {
    const { result, unmount } = await renderHook(() => usePopState());
    const before = result.current;
    await unmount();

    await act(async () => {
      window.history.pushState(null, "", "/after-unmount");
      window.dispatchEvent(new PopStateEvent("popstate"));
    });

    expect(result.current).toBe(before);
  });
});
