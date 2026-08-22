import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { useScript } from "./use-script.ts";

function TestComponent() {
  const { status } = useScript("https://example.com/ssr-probe.js");
  return status;
}

describe(useScript, () => {
  it("renders loading on the server, before any script tag can settle", () => {
    const html = renderToString(createElement(TestComponent));

    expect(html).toBe("loading");
  });
});
