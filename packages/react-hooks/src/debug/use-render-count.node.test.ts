import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useRenderCount } from "./use-render-count.ts";

const TestComponent = () => {
  const count = useRenderCount();
  return String(count);
};

afterEach(() => {
  vi.unstubAllEnvs();
});

describe(useRenderCount, () => {
  it("renders 1 on the first server render", () => {
    const html = renderToString(createElement(TestComponent));

    expect(html).toBe("1");
  });

  it("no-ops (renders 0) in production builds", () => {
    vi.stubEnv("NODE_ENV", "production");

    const html = renderToString(createElement(TestComponent));

    expect(html).toBe("0");
  });
});
