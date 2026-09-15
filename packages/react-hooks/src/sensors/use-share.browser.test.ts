import { describe, expect, it, vi } from "vitest";

import { renderHook } from "../../tests/_react.ts";
import { useShare } from "./use-share.ts";

const setNavigatorShare = (share: ((data: ShareData) => Promise<void>) | undefined) => {
  Object.defineProperty(navigator, "share", { configurable: true, value: share });
};

const setNavigatorCanShare = (canShare: ((data?: ShareData) => boolean) | undefined) => {
  Object.defineProperty(navigator, "canShare", { configurable: true, value: canShare });
};

describe("useShare", () => {
  it("reports supported: true when navigator.share exists", async () => {
    setNavigatorShare(vi.fn());

    const { result } = await renderHook(() => useShare());

    expect(result.current.supported).toBe(true);
  });

  it("reports supported: false when navigator.share is unavailable", async () => {
    setNavigatorShare(undefined);

    const { result } = await renderHook(() => useShare());

    expect(result.current.supported).toBe(false);
  });

  it("calls navigator.share with the given data", async () => {
    const share = vi.fn<() => Promise<undefined>>().mockResolvedValue(undefined);
    setNavigatorShare(share);

    const { result } = await renderHook(() => useShare());
    const data = { title: "Zap Studio" };

    await result.current.share(data);

    expect(share).toHaveBeenCalledWith(data);
  });

  it("delegates canShare to navigator.canShare when available", async () => {
    const canShare = vi.fn<() => boolean>(() => true);
    setNavigatorShare(vi.fn());
    setNavigatorCanShare(canShare);

    const { result } = await renderHook(() => useShare());
    const data = { title: "Zap Studio" };

    expect(result.current.canShare(data)).toBe(true);
    expect(canShare).toHaveBeenCalledWith(data);
  });

  it("falls back canShare to supported when navigator.canShare is unavailable", async () => {
    setNavigatorShare(vi.fn());
    setNavigatorCanShare(undefined);

    const { result } = await renderHook(() => useShare());

    expect(result.current.canShare()).toBe(true);
  });
});
