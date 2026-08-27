import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { useHotkeys } from "./use-hotkeys.ts";

const TestComponent = () => {
  useHotkeys({ "ctrl+s": vi.fn() });
  return "rendered";
};

describe(useHotkeys, () => {
  it("renders on the server without touching window", () => {
    const html = renderToString(createElement(TestComponent));

    expect(html).toBe("rendered");
  });
});
