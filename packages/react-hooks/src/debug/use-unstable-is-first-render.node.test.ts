import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useUnstableIsFirstRender } from "./use-unstable-is-first-render.ts";

function TestComponent() {
  const isFirst = useUnstableIsFirstRender();
  return isFirst ? "true" : "false";
}

afterEach(() => {
  vi.unstubAllEnvs();
});

describe(useUnstableIsFirstRender, () => {
  it("renders true on the first server render", () => {
    const html = renderToString(createElement(TestComponent));

    expect(html).toBe("true");
  });

  it("no-ops (renders false) in production builds", () => {
    vi.stubEnv("NODE_ENV", "production");

    const html = renderToString(createElement(TestComponent));

    expect(html).toBe("false");
  });
});
