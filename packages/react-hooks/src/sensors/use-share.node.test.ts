import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { useShare } from "./use-share.ts";

function TestComponent() {
  const { supported } = useShare();
  return supported ? "true" : "false";
}

describe(useShare, () => {
  it("renders unsupported on the server, without touching navigator", () => {
    const html = renderToString(createElement(TestComponent));

    expect(html).toBe("false");
  });
});
