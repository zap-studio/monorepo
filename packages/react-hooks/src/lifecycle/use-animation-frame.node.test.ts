import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { useAnimationFrame } from "./use-animation-frame.ts";

describe("useAnimationFrame", () => {
  it("renders without touching requestAnimationFrame during server rendering", () => {
    const callback = vi.fn<(deltaMs: number) => void>();
    const TestComponent = () => {
      useAnimationFrame(callback);
      return "rendered";
    };

    const html = renderToString(createElement(TestComponent));

    expect(html).toBe("rendered");
    expect(callback).not.toHaveBeenCalled();
  });
});
