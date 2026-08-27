import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { useIdleCallback } from "./use-idle-callback.ts";

describe("useIdleCallback", () => {
  it("renders without touching requestIdleCallback during server rendering", () => {
    const callback = vi.fn();
    const TestComponent = () => {
      useIdleCallback(callback);
      return "rendered";
    };

    const html = renderToString(createElement(TestComponent));

    expect(html).toBe("rendered");
    expect(callback).not.toHaveBeenCalled();
  });
});
