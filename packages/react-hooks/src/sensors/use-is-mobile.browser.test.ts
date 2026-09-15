import { describe, expect, it, vi } from "vitest";

import { createMatchMediaMock } from "../../tests/_media-query-test-utils.ts";
import { act, renderHook } from "../../tests/_react.ts";
import { useIsMobile } from "./use-is-mobile.ts";

describe("useIsMobile", () => {
  it("returns true when the viewport is below the default 768px breakpoint", async () => {
    const { matchMedia } = createMatchMediaMock(true);
    vi.spyOn(window, "matchMedia").mockImplementation(matchMedia);

    const { result } = await renderHook(() => useIsMobile());

    expect(result.current).toBe(true);
    expect(matchMedia).toHaveBeenCalledWith("(max-width: 767px)");
  });

  it("queries a custom breakpoint when given", async () => {
    const { matchMedia } = createMatchMediaMock(false);
    vi.spyOn(window, "matchMedia").mockImplementation(matchMedia);

    await renderHook(() => useIsMobile(1024));

    expect(matchMedia).toHaveBeenCalledWith("(max-width: 1023px)");
  });

  it("updates when crossing the breakpoint", async () => {
    const { matchMedia, setMatches } = createMatchMediaMock(false);
    vi.spyOn(window, "matchMedia").mockImplementation(matchMedia);

    const { result } = await renderHook(() => useIsMobile());
    expect(result.current).toBe(false);

    await act(async () => {
      setMatches(true);
    });

    expect(result.current).toBe(true);
  });
});
