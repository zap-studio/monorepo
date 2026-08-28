import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { createMatchMediaMock } from "../../tests/_media-query-test-utils.ts";
import { usePrefersDarkMode } from "./use-prefers-dark-mode.ts";

describe("usePrefersDarkMode", () => {
  it("is true when the OS prefers dark mode", () => {
    const { matchMedia } = createMatchMediaMock(true);
    vi.spyOn(window, "matchMedia").mockImplementation(matchMedia);

    const { result } = renderHook(() => usePrefersDarkMode());

    expect(result.current).toBe(true);
  });

  it("updates when the OS color scheme preference changes", async () => {
    const { matchMedia, setMatches } = createMatchMediaMock(false);
    vi.spyOn(window, "matchMedia").mockImplementation(matchMedia);

    const { result } = renderHook(() => usePrefersDarkMode());
    expect(result.current).toBe(false);

    await act(async () => {
      setMatches(true);
    });

    expect(result.current).toBe(true);
  });
});
