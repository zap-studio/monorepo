import { describe, expect, it, vi } from "vitest";

import { createMatchMediaMock } from "../../tests/_media-query-test-utils.ts";
import { act, renderHook } from "../../tests/_react.ts";
import { useStandaloneMode } from "./use-standalone-mode.ts";

describe("useStandaloneMode", () => {
  it("is true when the display-mode: standalone media query matches", async () => {
    const { matchMedia } = createMatchMediaMock(true);
    vi.spyOn(window, "matchMedia").mockImplementation(matchMedia);

    const { result } = await renderHook(() => useStandaloneMode());

    expect(result.current).toBe(true);
  });

  it("queries display-mode: standalone", async () => {
    const { matchMedia } = createMatchMediaMock(false);
    vi.spyOn(window, "matchMedia").mockImplementation(matchMedia);

    await renderHook(() => useStandaloneMode());

    expect(matchMedia).toHaveBeenCalledWith("(display-mode: standalone)");
  });

  it("updates when the app is installed/uninstalled as standalone", async () => {
    const { matchMedia, setMatches } = createMatchMediaMock(false);
    vi.spyOn(window, "matchMedia").mockImplementation(matchMedia);

    const { result } = await renderHook(() => useStandaloneMode());
    expect(result.current).toBe(false);

    await act(async () => {
      setMatches(true);
    });

    expect(result.current).toBe(true);
  });
});
