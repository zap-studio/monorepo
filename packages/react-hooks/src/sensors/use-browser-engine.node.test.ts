import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { useBrowserEngine } from "./use-browser-engine.ts";

const TestComponent = () => useBrowserEngine();

describe("useBrowserEngine", () => {
  it('renders "unknown" on the server, before the engine can be detected', () => {
    const html = renderToString(createElement(TestComponent));

    expect(html).toBe("unknown");
  });
});
