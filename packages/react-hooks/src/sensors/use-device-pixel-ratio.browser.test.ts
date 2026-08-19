import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useDevicePixelRatio } from "./use-device-pixel-ratio.ts";

function setDevicePixelRatio(value: number) {
  Object.defineProperty(window, "devicePixelRatio", { configurable: true, value });
}

function createMatchMediaMock() {
  const lists: { query: string; matchMediaList: MediaQueryList; listener?: () => void }[] = [];

  const matchMedia = vi.fn((query: string) => {
    const list = {
      addEventListener: (_type: "change", listener: () => void) => {
        const entry = lists.find((item) => item.matchMediaList === list);
        if (entry) {
          entry.listener = listener;
        }
      },
      removeEventListener: () => {},
    } as MediaQueryList;
    lists.push({ matchMediaList: list, query });
    return list;
  });

  return {
    fireLatestChange: () => {
      const latest = lists.at(-1);
      latest?.listener?.();
    },
    matchMedia,
  };
}

describe(useDevicePixelRatio, () => {
  it("reports the current window.devicePixelRatio", () => {
    setDevicePixelRatio(2);
    const { matchMedia } = createMatchMediaMock();
    vi.spyOn(window, "matchMedia").mockImplementation(matchMedia);

    const { result } = renderHook(() => useDevicePixelRatio());

    expect(result.current).toBe(2);
  });

  it("updates when the resolution media query fires a change", async () => {
    setDevicePixelRatio(1);
    const { fireLatestChange, matchMedia } = createMatchMediaMock();
    vi.spyOn(window, "matchMedia").mockImplementation(matchMedia);

    const { result } = renderHook(() => useDevicePixelRatio());
    expect(result.current).toBe(1);

    await act(async () => {
      setDevicePixelRatio(2);
      fireLatestChange();
    });

    expect(result.current).toBe(2);
  });
});
