import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useAppBadge } from "./use-app-badge.ts";

const setBadgeSupport = (
  api:
    | { clearAppBadge: () => Promise<void>; setAppBadge: (count?: number) => Promise<void> }
    | undefined,
) => {
  Object.defineProperty(navigator, "setAppBadge", {
    configurable: true,
    value: api?.setAppBadge,
  });
  Object.defineProperty(navigator, "clearAppBadge", {
    configurable: true,
    value: api?.clearAppBadge,
  });
};

afterEach(() => {
  setBadgeSupport(undefined);
});

describe("useAppBadge", () => {
  it("reports supported: true when the Badging API exists", () => {
    setBadgeSupport({
      clearAppBadge: vi.fn<() => Promise<undefined>>(async () => undefined),
      setAppBadge: vi.fn<() => Promise<undefined>>(async () => undefined),
    });

    const { result } = renderHook(() => useAppBadge());

    expect(result.current.supported).toBe(true);
  });

  it("reports supported: false when the Badging API is unavailable", () => {
    setBadgeSupport(undefined);

    const { result } = renderHook(() => useAppBadge());

    expect(result.current.supported).toBe(false);
  });

  it("calls navigator.setAppBadge() with the given count", async () => {
    const setAppBadge = vi.fn<() => Promise<undefined>>(async () => undefined);
    setBadgeSupport({
      clearAppBadge: vi.fn<() => Promise<undefined>>(async () => undefined),
      setAppBadge,
    });

    const { result } = renderHook(() => useAppBadge());

    await act(async () => {
      await result.current.setBadge(3);
    });

    expect(setAppBadge).toHaveBeenCalledWith(3);
  });

  it("calls navigator.setAppBadge() with no count for a plain badge", async () => {
    const setAppBadge = vi.fn<() => Promise<undefined>>(async () => undefined);
    setBadgeSupport({
      clearAppBadge: vi.fn<() => Promise<undefined>>(async () => undefined),
      setAppBadge,
    });

    const { result } = renderHook(() => useAppBadge());

    await act(async () => {
      await result.current.setBadge();
    });

    expect(setAppBadge).toHaveBeenCalledWith(undefined);
  });

  it("calls navigator.clearAppBadge()", async () => {
    const clearAppBadge = vi.fn<() => Promise<undefined>>(async () => undefined);
    setBadgeSupport({
      clearAppBadge,
      setAppBadge: vi.fn<() => Promise<undefined>>(async () => undefined),
    });

    const { result } = renderHook(() => useAppBadge());

    await act(async () => {
      await result.current.clearBadge();
    });

    expect(clearAppBadge).toHaveBeenCalledTimes(1);
  });

  it("no-ops setBadge()/clearBadge() when unsupported", async () => {
    setBadgeSupport(undefined);

    const { result } = renderHook(() => useAppBadge());

    await act(async () => {
      await result.current.setBadge(1);
      await result.current.clearBadge();
    });

    expect(result.current.supported).toBe(false);
  });
});
