import { describe, expect, it } from "vitest";

import { renderHook } from "../../tests/_react.ts";
import { useDeviceCapabilities } from "./use-device-capabilities.ts";

const setHardwareConcurrency = (value: number) => {
  Object.defineProperty(navigator, "hardwareConcurrency", { configurable: true, value });
};

const setDeviceMemory = (value: number | undefined) => {
  Object.defineProperty(navigator, "deviceMemory", { configurable: true, value });
};

describe("useDeviceCapabilities", () => {
  it("reports hardwareConcurrency and deviceMemory when both are available", async () => {
    setHardwareConcurrency(8);
    setDeviceMemory(4);

    const { result, unmount } = await renderHook(() => useDeviceCapabilities());

    expect(result.current).toEqual({ deviceMemory: 4, hardwareConcurrency: 8 });
    await unmount();
  });

  it("leaves deviceMemory undefined where the Chromium-only API is unsupported", async () => {
    setHardwareConcurrency(4);
    setDeviceMemory(undefined);

    const { result } = await renderHook(() => useDeviceCapabilities());

    expect(result.current).toEqual({ hardwareConcurrency: 4 });
  });
});
