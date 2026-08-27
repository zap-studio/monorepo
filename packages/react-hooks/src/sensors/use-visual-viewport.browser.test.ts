import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useVisualViewport } from "./use-visual-viewport.ts";

const createVisualViewportMock = (initial: {
  height: number;
  offsetLeft: number;
  offsetTop: number;
  pageLeft: number;
  pageTop: number;
  scale: number;
  width: number;
}) => {
  const viewport = new EventTarget() as unknown as VisualViewport;
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
