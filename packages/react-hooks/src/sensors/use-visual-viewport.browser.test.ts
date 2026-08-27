import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useVisualViewport } from "./use-visual-viewport.ts";

// SAFETY: single explicit escape hatch for casting test doubles / deliberately
// non-conforming fixtures to a type they don't structurally satisfy, instead of
// scattering `as unknown as X` chains through the test body.
const asTestDouble = <T>(value: unknown): T => value as T;

const createVisualViewportMock = (initial: {
  height: number;
  offsetLeft: number;
  offsetTop: number;
  pageLeft: number;
  pageTop: number;
  scale: number;
  width: number;
}) => {
  // SAFETY: the hook only calls addEventListener/removeEventListener (inherited from
  // EventTarget) and reads the seven numeric getters defined via Object.defineProperties below.
  const viewport = asTestDouble<VisualViewport>(new EventTarget());
  let state = { ...initial };

  Object.defineProperties(viewport, {
    height: { configurable: true, get: () => state.height },
    offsetLeft: { configurable: true, get: () => state.offsetLeft },
    offsetTop: { configurable: true, get: () => state.offsetTop },
    pageLeft: { configurable: true, get: () => state.pageLeft },
    pageTop: { configurable: true, get: () => state.pageTop },
    scale: { configurable: true, get: () => state.scale },
    width: { configurable: true, get: () => state.width },
  });

  return {
    setState: (next: Partial<typeof state>) => {
      state = { ...state, ...next };
      viewport.dispatchEvent(new Event("resize"));
    },
    viewport,
  };
};

const setWindowVisualViewport = (viewport: VisualViewport | null) => {
  Object.defineProperty(window, "visualViewport", { configurable: true, value: viewport });
};

describe("useVisualViewport", () => {
  it("reports the current window.visualViewport", () => {
    const { viewport } = createVisualViewportMock({
      height: 500,
      offsetLeft: 0,
      offsetTop: 0,
      pageLeft: 0,
      pageTop: 0,
      scale: 1,
      width: 375,
    });
    setWindowVisualViewport(viewport);

    const { result } = renderHook(() => useVisualViewport());

    expect(result.current).toEqual({
      height: 500,
      offsetLeft: 0,
      offsetTop: 0,
      pageLeft: 0,
      pageTop: 0,
      scale: 1,
      width: 375,
    });
  });

  it("updates when visualViewport fires a resize event (e.g. on-screen keyboard)", async () => {
    const { setState, viewport } = createVisualViewportMock({
      height: 500,
      offsetLeft: 0,
      offsetTop: 0,
      pageLeft: 0,
      pageTop: 0,
      scale: 1,
      width: 375,
    });
    setWindowVisualViewport(viewport);

    const { result } = renderHook(() => useVisualViewport());
    expect(result.current.height).toBe(500);

    await act(async () => {
      setState({ height: 300 });
    });

    expect(result.current.height).toBe(300);
  });

  it("falls back to defaults when visualViewport is unsupported", () => {
    setWindowVisualViewport(null);

    const { result } = renderHook(() => useVisualViewport());

    expect(result.current).toEqual({
      height: 0,
      offsetLeft: 0,
      offsetTop: 0,
      pageLeft: 0,
      pageTop: 0,
      scale: 1,
      width: 0,
    });
  });
});
