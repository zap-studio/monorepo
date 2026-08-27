import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { useThrottle } from "./use-throttle.ts";

describe("useThrottle", () => {
  it("renders without touching timers during server rendering", () => {
    const callback = vi.fn();
    const TestComponent = () => {
      useThrottle(callback, 500);
      return "rendered";
    };

    const html = renderToString(createElement(TestComponent));

    expect(html).toBe("rendered");
    expect(callback).not.toHaveBeenCalled();
  });
});
