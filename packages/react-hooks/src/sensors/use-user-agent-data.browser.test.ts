import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useUserAgentData } from "./use-user-agent-data.ts";

function setUserAgentData(data: unknown) {
  Object.defineProperty(navigator, "userAgentData", { configurable: true, value: data });
}

describe(useUserAgentData, () => {
  it("reports navigator.userAgentData when available", () => {
    setUserAgentData({
      brands: [{ brand: "Chromium", version: "130" }],
      mobile: false,
      platform: "macOS",
    });

    const { result, unmount } = renderHook(() => useUserAgentData());

    expect(result.current).toEqual({
      brands: [{ brand: "Chromium", version: "130" }],
      mobile: false,
      platform: "macOS",
    });
    unmount();
  });

  it("is undefined when User-Agent Client Hints is unsupported", () => {
    setUserAgentData(undefined);

    const { result } = renderHook(() => useUserAgentData());

    expect(result.current).toBeUndefined();
  });
});
