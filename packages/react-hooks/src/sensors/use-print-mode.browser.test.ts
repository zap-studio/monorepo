import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { createMatchMediaMock } from "./_media-query-test-utils.ts";
import { usePrintMode } from "./use-print-mode.ts";

describe("usePrintMode", () => {
  it("is true when the print media query matches", () => {
    const { matchMedia } = createMatchMediaMock(true);
    vi.spyOn(window, "matchMedia").mockImplementation(matchMedia);

    const { result } = renderHook(() => usePrintMode());

    expect(result.current).toBe(true);
  });

  it("queries the print media, not the raw print events", () => {
    const { matchMedia } = createMatchMediaMock(false);
    vi.spyOn(window, "matchMedia").mockImplementation(matchMedia);

    renderHook(() => usePrintMode());

    expect(matchMedia).toHaveBeenCalledWith("print");
  });

  it("updates when print mode is entered and exited", async () => {
    const { matchMedia, setMatches } = createMatchMediaMock(false);
    vi.spyOn(window, "matchMedia").mockImplementation(matchMedia);

    const { result } = renderHook(() => usePrintMode());
    expect(result.current).toBe(false);

    await act(async () => {
      setMatches(true);
    });

    expect(result.current).toBe(true);
  });
});
