import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useUnstableRenderDuration } from "./use-unstable-render-duration.ts";

function TestComponent() {
  const { samples } = useUnstableRenderDuration();
  return String(samples.length);
}

afterEach(() => {
  vi.unstubAllEnvs();
});

describe(useUnstableRenderDuration, () => {
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
