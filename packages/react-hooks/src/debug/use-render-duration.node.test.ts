import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useRenderDuration } from "./use-render-duration.ts";

const TestComponent = () => {
  const { samples } = useRenderDuration();
  return String(samples.length);
};

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("useRenderDuration", () => {
  it("renders with no samples on the server", () => {
    const html = renderToString(createElement(TestComponent));

    expect(html).toBe("0");
  });

  it("no-ops (still no samples) in production builds", () => {
    vi.stubEnv("NODE_ENV", "production");

    const html = renderToString(createElement(TestComponent));

    expect(html).toBe("0");
  });
});
