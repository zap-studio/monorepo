import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useIsFirstRender } from "./use-is-first-render.ts";

const TestComponent = () => {
  const isFirst = useIsFirstRender();
  return isFirst ? "true" : "false";
};

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("useIsFirstRender", () => {
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
