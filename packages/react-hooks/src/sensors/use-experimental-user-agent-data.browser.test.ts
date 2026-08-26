import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useExperimentalUserAgentData } from "./use-experimental-user-agent-data.ts";

function setUserAgentData(data: unknown) {
  Object.defineProperty(navigator, "userAgentData", { configurable: true, value: data });
}

describe(useExperimentalUserAgentData, () => {
  it("reports navigator.userAgentData when available", () => {
    setUserAgentData({
      brands: [{ brand: "Chromium", version: "130" }],
      mobile: false,
      platform: "macOS",
    });

    const { result, unmount } = renderHook(() => useExperimentalUserAgentData());

    expect(result.current).toEqual({
      brands: [{ brand: "Chromium", version: "130" }],
      mobile: false,
      platform: "macOS",
    });
    unmount();
  });

  it("is undefined when User-Agent Client Hints is unsupported", () => {
    setUserAgentData(undefined);

    const { result } = renderHook(() => useExperimentalUserAgentData());

    expect(result.current).toBeUndefined();
  });
});
