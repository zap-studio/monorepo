import { describe, expect, it } from "vitest";

import { act, renderHook } from "../../tests/_react.ts";
import { useOnlineStatus } from "./use-online-status.ts";

const setNavigatorOnLine = (value: boolean) => {
  Object.defineProperty(navigator, "onLine", {
    configurable: true,
    get: () => value,
  });
};

describe("useOnlineStatus", () => {
  it("reflects navigator.onLine on mount", async () => {
    setNavigatorOnLine(false);

    const { result, unmount } = await renderHook(() => useOnlineStatus());

    expect(result.current).toBe(false);

    await unmount();
  });

  it("updates when the browser goes offline", async () => {
    setNavigatorOnLine(true);
    const { result } = await renderHook(() => useOnlineStatus());
    expect(result.current).toBe(true);

    await act(async () => {
      setNavigatorOnLine(false);
      window.dispatchEvent(new Event("offline"));
    });

    expect(result.current).toBe(false);
  });

  it("updates when the browser comes back online", async () => {
    setNavigatorOnLine(false);
    const { result } = await renderHook(() => useOnlineStatus());
    expect(result.current).toBe(false);

    await act(async () => {
      setNavigatorOnLine(true);
      window.dispatchEvent(new Event("online"));
    });

    expect(result.current).toBe(true);
  });
});
