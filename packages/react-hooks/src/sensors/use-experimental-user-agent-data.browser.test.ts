import { describe, expect, it } from "vitest";

import { renderHook } from "../../tests/_react.ts";
import { useExperimentalUserAgentData } from "./use-experimental-user-agent-data.ts";

const setUserAgentData = (data: unknown) => {
  Object.defineProperty(navigator, "userAgentData", { configurable: true, value: data });
};

describe("useExperimentalUserAgentData", () => {
  it("reports navigator.userAgentData when available", async () => {
    setUserAgentData({
      brands: [{ brand: "Chromium", version: "130" }],
      mobile: false,
      platform: "macOS",
    });

    const { result, unmount } = await renderHook(() => useExperimentalUserAgentData());

    expect(result.current).toEqual({
      brands: [{ brand: "Chromium", version: "130" }],
      mobile: false,
      platform: "macOS",
    });
    await unmount();
  });

  it("is undefined when User-Agent Client Hints is unsupported", async () => {
    setUserAgentData(undefined);

    const { result } = await renderHook(() => useExperimentalUserAgentData());

    expect(result.current).toBeUndefined();
  });
});
