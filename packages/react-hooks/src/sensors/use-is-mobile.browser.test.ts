import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { createMatchMediaMock } from "./_media-query-test-utils.ts";
import { useIsMobile } from "./use-is-mobile.ts";

describe("useIsMobile", () => {
  it("returns true when the viewport is below the default 768px breakpoint", () => {
    const { matchMedia } = createMatchMediaMock(true);
    vi.spyOn(window, "matchMedia").mockImplementation(matchMedia);

    const { result } = renderHook(() => useIsMobile());

    expect(result.current).toBe(true);
    expect(matchMedia).toHaveBeenCalledWith("(max-width: 767px)");
  });

  it("queries a custom breakpoint when given", () => {
    const { matchMedia } = createMatchMediaMock(false);
    vi.spyOn(window, "matchMedia").mockImplementation(matchMedia);

    renderHook(() => useIsMobile(1024));

    expect(matchMedia).toHaveBeenCalledWith("(max-width: 1023px)");
  });

  it("updates when crossing the breakpoint", async () => {
    const { matchMedia, setMatches } = createMatchMediaMock(false);
    vi.spyOn(window, "matchMedia").mockImplementation(matchMedia);

    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);

    await act(async () => {
      setMatches(true);
    });

    expect(result.current).toBe(true);
  });
});
