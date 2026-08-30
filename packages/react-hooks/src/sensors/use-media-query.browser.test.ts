import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { createMatchMediaMock } from "../../tests/_media-query-test-utils.ts";
import { useMediaQuery } from "./use-media-query.ts";

describe("useMediaQuery", () => {
  it("returns the current match state for the query", () => {
    const { matchMedia } = createMatchMediaMock(true);
    vi.spyOn(window, "matchMedia").mockImplementation(matchMedia);

    const { result } = renderHook(() => useMediaQuery("(min-width: 600px)"));

    expect(result.current).toBe(true);
  });

  it("updates when the media query match changes", async () => {
    const { matchMedia, setMatches } = createMatchMediaMock(false);
    vi.spyOn(window, "matchMedia").mockImplementation(matchMedia);

    const { result } = renderHook(() => useMediaQuery("(min-width: 600px)"));
    expect(result.current).toBe(false);

    await act(async () => {
      setMatches(true);
    });

    expect(result.current).toBe(true);
  });

  it("queries the exact media query string given", () => {
    const { matchMedia } = createMatchMediaMock(false);
    vi.spyOn(window, "matchMedia").mockImplementation(matchMedia);

    renderHook(() => useMediaQuery("(prefers-color-scheme: dark)"));

    expect(matchMedia).toHaveBeenCalledWith("(prefers-color-scheme: dark)");
  });
});
