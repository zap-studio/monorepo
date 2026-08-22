import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { useCopyToClipboard } from "./use-copy-to-clipboard.ts";

function TestComponent() {
  const { copied } = useCopyToClipboard();
  return copied ? "true" : "false";
}

describe(useCopyToClipboard, () => {
  it("renders copied: false on the server", () => {
    const html = renderToString(createElement(TestComponent));

    expect(html).toBe("false");
  });
});
