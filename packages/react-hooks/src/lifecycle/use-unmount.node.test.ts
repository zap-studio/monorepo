import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { useUnmount } from "./use-unmount.ts";

describe(useUnmount, () => {
  it("does not call the cleanup during server rendering", () => {
    const cleanup = vi.fn();
    function TestComponent() {
      useUnmount(cleanup);
      return "rendered";
    }

    const html = renderToString(createElement(TestComponent));

    expect(html).toBe("rendered");
    expect(cleanup).not.toHaveBeenCalled();
  });
});
