import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { createMatchMediaMock } from "../sensors/_media-query-test-utils.ts";
import { useStandaloneMode } from "./use-standalone-mode.ts";

describe("useStandaloneMode", () => {
  it("is true when the display-mode: standalone media query matches", () => {
    const { matchMedia } = createMatchMediaMock(true);
    vi.spyOn(window, "matchMedia").mockImplementation(matchMedia);

    const { result } = renderHook(() => useStandaloneMode());

    expect(result.current).toBe(true);
  });

  it("queries display-mode: standalone", () => {
    const { matchMedia } = createMatchMediaMock(false);
    vi.spyOn(window, "matchMedia").mockImplementation(matchMedia);

    renderHook(() => useStandaloneMode());

    expect(matchMedia).toHaveBeenCalledWith("(display-mode: standalone)");
  });

  it("updates when the app is installed/uninstalled as standalone", async () => {
    const { matchMedia, setMatches } = createMatchMediaMock(false);
    vi.spyOn(window, "matchMedia").mockImplementation(matchMedia);

    const { result } = renderHook(() => useStandaloneMode());
    expect(result.current).toBe(false);

    await act(async () => {
      setMatches(true);
    });

    expect(result.current).toBe(true);
  });
});
