import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useDeviceCapabilities } from "./use-device-capabilities.ts";

function setHardwareConcurrency(value: number) {
  Object.defineProperty(navigator, "hardwareConcurrency", { configurable: true, value });
}

function setDeviceMemory(value: number | undefined) {
  Object.defineProperty(navigator, "deviceMemory", { configurable: true, value });
}

describe(useDeviceCapabilities, () => {
  it("reports hardwareConcurrency and deviceMemory when both are available", () => {
    setHardwareConcurrency(8);
    setDeviceMemory(4);

    const { result, unmount } = renderHook(() => useDeviceCapabilities());

    expect(result.current).toEqual({ deviceMemory: 4, hardwareConcurrency: 8 });
    unmount();
  });

  it("leaves deviceMemory undefined where the Chromium-only API is unsupported", () => {
    setHardwareConcurrency(4);
    setDeviceMemory(undefined);

    const { result } = renderHook(() => useDeviceCapabilities());

    expect(result.current).toEqual({ deviceMemory: undefined, hardwareConcurrency: 4 });
  });
});
