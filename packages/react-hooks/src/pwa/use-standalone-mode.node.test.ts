import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { useStandaloneMode } from "./use-standalone-mode.ts";

const TestComponent = () => {
  return useStandaloneMode() ? "true" : "false";
};

describe(useStandaloneMode, () => {
  it('renders "false" on the server, before matchMedia can run', () => {
    const html = renderToString(createElement(TestComponent));

    expect(html).toBe("false");
  });
});
