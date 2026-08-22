import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { usePrevious } from "./use-previous.ts";

function TestComponent() {
  const previous = usePrevious(1);
  return previous === undefined ? "undefined" : String(previous);
}

describe(usePrevious, () => {
  it("renders undefined on the server, before any render has committed", () => {
    const html = renderToString(createElement(TestComponent));

    expect(html).toBe("undefined");
  });
});
