import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { createMatchMediaMock } from "./_media-query-test-utils.ts";
import { useColorScheme } from "./use-color-scheme.ts";

describe(useColorScheme, () => {
  it('returns "dark" when the OS prefers dark mode', () => {
    const { matchMedia } = createMatchMediaMock(true);
    vi.spyOn(window, "matchMedia").mockImplementation(matchMedia);

    const { result } = renderHook(() => useColorScheme());

    expect(result.current).toBe("dark");
  });

  it('returns "light" when the OS does not prefer dark mode', () => {
    const { matchMedia } = createMatchMediaMock(false);
    vi.spyOn(window, "matchMedia").mockImplementation(matchMedia);

    const { result } = renderHook(() => useColorScheme());

    expect(result.current).toBe("light");
  });

  it("updates when the OS color scheme preference changes", async () => {
    const { matchMedia, setMatches } = createMatchMediaMock(false);
    vi.spyOn(window, "matchMedia").mockImplementation(matchMedia);

    const { result } = renderHook(() => useColorScheme());
    expect(result.current).toBe("light");

    await act(async () => {
      setMatches(true);
    });

    expect(result.current).toBe("dark");
  });
});
