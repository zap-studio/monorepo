import { describe, expect, it, vi } from "vitest";

import { renderHook } from "../../tests/_react.ts";
import { useBrowserEngine } from "./use-browser-engine.ts";

const setUserAgentData = (data: unknown) => {
  Object.defineProperty(navigator, "userAgentData", { configurable: true, value: data });
};

const stubCssSupports = (matches: (query: string) => boolean) => {
  vi.spyOn(CSS, "supports").mockImplementation((conditionText: string) => matches(conditionText));
};

describe("useBrowserEngine", () => {
  it('reports "blink" when User-Agent Client Hints is available', async () => {
    setUserAgentData({ brands: [], mobile: false, platform: "" });

    const { result } = await renderHook(() => useBrowserEngine());

    expect(result.current).toBe("blink");
  });

  it('reports "gecko" when Client Hints is absent but -moz- properties are supported', async () => {
    setUserAgentData(undefined);
    stubCssSupports((query) => query.includes("-moz-"));

    const { result } = await renderHook(() => useBrowserEngine());

    expect(result.current).toBe("gecko");
  });

  it('reports "webkit" when only -webkit- properties are supported', async () => {
    setUserAgentData(undefined);
    stubCssSupports((query) => query.includes("-webkit-"));

    const { result } = await renderHook(() => useBrowserEngine());

    expect(result.current).toBe("webkit");
  });

  it('reports "unknown" when none of the signals match', async () => {
    setUserAgentData(undefined);
    stubCssSupports(() => false);

    const { result } = await renderHook(() => useBrowserEngine());

    expect(result.current).toBe("unknown");
  });
});
