import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { useInterval } from "./use-interval.ts";

describe("useInterval", () => {
  it("does not schedule during server rendering", () => {
    const callback = vi.fn<() => void>();
    const TestComponent = () => {
      useInterval(callback, 1000);
      return "rendered";
    };

    const html = renderToString(createElement(TestComponent));

    expect(html).toBe("rendered");
    expect(callback).not.toHaveBeenCalled();
  });
});
