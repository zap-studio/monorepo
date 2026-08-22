import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { createMatchMediaMock } from "../sensors/_media-query-test-utils.ts";
import { useTheme } from "./use-theme.ts";

afterEach(() => {
  window.localStorage.clear();
});

describe(useTheme, () => {
  it('defaults to theme: "system"', () => {
    const { matchMedia } = createMatchMediaMock(false);
    vi.spyOn(window, "matchMedia").mockImplementation(matchMedia);

    const { result } = renderHook(() => useTheme());

    expect(result.current.theme).toBe("system");
  });

  it('resolves to the OS preference when theme is "system" and OS prefers dark', () => {
    const { matchMedia } = createMatchMediaMock(true);
    vi.spyOn(window, "matchMedia").mockImplementation(matchMedia);

    const { result } = renderHook(() => useTheme());

    expect(result.current.resolvedTheme).toBe("dark");
  });

  it('resolves to the OS preference when theme is "system" and OS prefers light', () => {
    const { matchMedia } = createMatchMediaMock(false);
    vi.spyOn(window, "matchMedia").mockImplementation(matchMedia);

    const { result } = renderHook(() => useTheme());

    expect(result.current.resolvedTheme).toBe("light");
  });

  it("setTheme() overrides the OS preference and persists it", () => {
    const { matchMedia } = createMatchMediaMock(true);
    vi.spyOn(window, "matchMedia").mockImplementation(matchMedia);

    const { result } = renderHook(() => useTheme());

    act(() => {
      result.current.setTheme("light");
    });

    expect(result.current.theme).toBe("light");
    expect(result.current.resolvedTheme).toBe("light");
    expect(window.localStorage.getItem("zap-studio-theme")).toBe('"light"');
  });

  it('resolvedTheme equals theme when it is not "system"', () => {
    const { matchMedia } = createMatchMediaMock(false);
    vi.spyOn(window, "matchMedia").mockImplementation(matchMedia);

    const { result } = renderHook(() => useTheme());

    act(() => {
      result.current.setTheme("dark");
    });

    expect(result.current.theme).toBe("dark");
    expect(result.current.resolvedTheme).toBe("dark");
  });

  it("reads a previously persisted theme on mount", () => {
    window.localStorage.setItem("zap-studio-theme", JSON.stringify("dark"));
    const { matchMedia } = createMatchMediaMock(false);
    vi.spyOn(window, "matchMedia").mockImplementation(matchMedia);

    const { result } = renderHook(() => useTheme());

    expect(result.current.theme).toBe("dark");
    expect(result.current.resolvedTheme).toBe("dark");
  });

  it('tracks the OS preference again after switching back to "system"', async () => {
    const { matchMedia, setMatches } = createMatchMediaMock(false);
    vi.spyOn(window, "matchMedia").mockImplementation(matchMedia);

    const { result } = renderHook(() => useTheme());

    act(() => {
      result.current.setTheme("dark");
    });
    expect(result.current.resolvedTheme).toBe("dark");

    act(() => {
      result.current.setTheme("system");
    });
    expect(result.current.resolvedTheme).toBe("light");

    await act(async () => {
      setMatches(true);
    });
    expect(result.current.resolvedTheme).toBe("dark");
  });
});
