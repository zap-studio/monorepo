import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useFontsReady } from "./use-fonts-ready.ts";

describe(useFontsReady, () => {
  it("starts false", () => {
    const { result } = renderHook(() => useFontsReady());

    expect(result.current).toBe(false);
  });

  it("becomes true once document.fonts.ready resolves", async () => {
    const { result } = renderHook(() => useFontsReady());

    await waitFor(() => expect(result.current).toBe(true));
  });

  it("resolves immediately when the CSS Font Loading API is unsupported", async () => {
    const originalFonts = document.fonts;
    Object.defineProperty(document, "fonts", { configurable: true, value: undefined });

    const { result } = renderHook(() => useFontsReady());

    await waitFor(() => expect(result.current).toBe(true));

    Object.defineProperty(document, "fonts", { configurable: true, value: originalFonts });
  });
});
