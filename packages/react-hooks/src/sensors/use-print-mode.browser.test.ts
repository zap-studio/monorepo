import { describe, expect, it, vi } from "vitest";

import { createMatchMediaMock } from "../../tests/_media-query-test-utils.ts";
import { act, renderHook } from "../../tests/_react.ts";
import { usePrintMode } from "./use-print-mode.ts";

describe("usePrintMode", () => {
  it("is true when the print media query matches", async () => {
    const { matchMedia } = createMatchMediaMock(true);
    vi.spyOn(window, "matchMedia").mockImplementation(matchMedia);

    const { result } = await renderHook(() => usePrintMode());

    expect(result.current).toBe(true);
  });

  it("queries the print media, not the raw print events", async () => {
    const { matchMedia } = createMatchMediaMock(false);
    vi.spyOn(window, "matchMedia").mockImplementation(matchMedia);

    await renderHook(() => usePrintMode());

    expect(matchMedia).toHaveBeenCalledWith("print");
  });

  it("updates when print mode is entered and exited", async () => {
    const { matchMedia, setMatches } = createMatchMediaMock(false);
    vi.spyOn(window, "matchMedia").mockImplementation(matchMedia);

    const { result } = await renderHook(() => usePrintMode());
    expect(result.current).toBe(false);

    await act(async () => {
      setMatches(true);
    });

    expect(result.current).toBe(true);
  });
});
