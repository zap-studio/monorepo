import { describe, expect, it, vi } from "vitest";

import { act, renderHook } from "../../tests/_react.ts";
import { useFontsReady } from "./use-fonts-ready.ts";

// `document.fonts` is an inherited Document.prototype getter in a real browser, so
// Reflect.deleteProperty on the instance is a no-op; shadow it with an own property instead.
const stubFonts = (value: unknown) => {
  const original = document.fonts;
  Object.defineProperty(document, "fonts", { configurable: true, value });

  return () => {
    Object.defineProperty(document, "fonts", { configurable: true, value: original });
  };
};

describe("useFontsReady", () => {
  it("starts false", async () => {
    // Rendering flushes microtasks, so the real (already settled) `ready` promise
    // would resolve before the assertion runs.
    const restoreFonts = stubFonts({ ready: new Promise(() => undefined) });

    try {
      const { result } = await renderHook(() => useFontsReady());

      expect(result.current).toBe(false);
    } finally {
      restoreFonts();
    }
  });

  it("becomes true once document.fonts.ready resolves", async () => {
    const { result } = await renderHook(() => useFontsReady());

    await vi.waitFor(() => expect(result.current).toBe(true));
  });

  it("resolves immediately when the CSS Font Loading API is unsupported", async () => {
    const restoreFonts = stubFonts(void 0);

    try {
      const { result } = await renderHook(() => useFontsReady());

      await vi.waitFor(() => expect(result.current).toBe(true));
    } finally {
      restoreFonts();
    }
  });

  it("ignores a late resolution if the component unmounted first", async () => {
    let resolveReady: () => void = () => undefined;
    const ready = new Promise<void>((resolve) => {
      resolveReady = resolve;
    });
    const restoreFonts = stubFonts({ ready });

    try {
      const { result, unmount } = await renderHook(() => useFontsReady());
      await unmount();

      await act(async () => {
        resolveReady();
        await ready;
      });

      expect(result.current).toBe(false);
    } finally {
      restoreFonts();
    }
  });
});
