import { renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useExperimentalLocalFonts } from "./use-experimental-local-fonts.ts";

const notAllowedError = (): Error => {
  const error = new Error("Permission denied.");
  error.name = "NotAllowedError";
  return error;
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe(useExperimentalLocalFonts, () => {
  it("reports supported: false when queryLocalFonts is unavailable", () => {
    vi.stubGlobal("queryLocalFonts", undefined);

    const { result } = renderHook(() => useExperimentalLocalFonts());

    expect(result.current.supported).toBe(false);
  });

  it("reports supported: true when window.queryLocalFonts exists", () => {
    vi.stubGlobal("queryLocalFonts", vi.fn());

    const { result } = renderHook(() => useExperimentalLocalFonts());

    expect(result.current.supported).toBe(true);
  });

  it("query() forwards options and resolves the font list", async () => {
    const fonts = [
      {
        family: "Comic Sans MS",
        fullName: "Comic Sans MS",
        postscriptName: "ComicSansMS",
        style: "Regular",
      },
    ];
    const queryLocalFonts = vi.fn().mockResolvedValue(fonts);
    vi.stubGlobal("queryLocalFonts", queryLocalFonts);

    const { result } = renderHook(() => useExperimentalLocalFonts());

    await expect(result.current.query({ postscriptNames: ["ComicSansMS"] })).resolves.toEqual(
      fonts,
    );
    expect(queryLocalFonts).toHaveBeenCalledWith({ postscriptNames: ["ComicSansMS"] });
  });

  it("query() resolves undefined when the user denies the permission prompt", async () => {
    vi.stubGlobal("queryLocalFonts", () => Promise.reject(notAllowedError()));

    const { result } = renderHook(() => useExperimentalLocalFonts());

    await expect(result.current.query()).resolves.toBeUndefined();
  });

  it("query() rethrows other errors", async () => {
    vi.stubGlobal("queryLocalFonts", () => Promise.reject(new Error("boom")));

    const { result } = renderHook(() => useExperimentalLocalFonts());

    await expect(result.current.query()).rejects.toThrow("boom");
  });

  it("query() resolves undefined when unsupported", async () => {
    vi.stubGlobal("queryLocalFonts", undefined);

    const { result } = renderHook(() => useExperimentalLocalFonts());

    await expect(result.current.query()).resolves.toBeUndefined();
  });
});
