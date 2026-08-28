import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useBrowserEngine } from "./use-browser-engine.ts";

const setUserAgentData = (data: unknown) => {
  Object.defineProperty(navigator, "userAgentData", { configurable: true, value: data });
};

const stubCssSupports = (matches: (query: string) => boolean) => {
  // SAFETY: CSS.supports() has a two-argument (property, value) overload alongside the one-argument (conditionText) overload used here; the stub only ever needs the single-argument form.
  vi.spyOn(CSS, "supports").mockImplementation(matches as typeof CSS.supports);
};

describe("useBrowserEngine", () => {
  it('reports "blink" when User-Agent Client Hints is available', () => {
    setUserAgentData({ brands: [], mobile: false, platform: "" });

    const { result } = renderHook(() => useBrowserEngine());

    expect(result.current).toBe("blink");
  });

  it('reports "gecko" when Client Hints is absent but -moz- properties are supported', () => {
    setUserAgentData(undefined);
    stubCssSupports((query) => query.includes("-moz-"));

    const { result } = renderHook(() => useBrowserEngine());

    expect(result.current).toBe("gecko");
  });

  it('reports "webkit" when only -webkit- properties are supported', () => {
    setUserAgentData(undefined);
    stubCssSupports((query) => query.includes("-webkit-"));

    const { result } = renderHook(() => useBrowserEngine());

    expect(result.current).toBe("webkit");
  });

  it('reports "unknown" when none of the signals match', () => {
    setUserAgentData(undefined);
    stubCssSupports(() => false);

    const { result } = renderHook(() => useBrowserEngine());

    expect(result.current).toBe("unknown");
  });
});
