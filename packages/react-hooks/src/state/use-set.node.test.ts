import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { useSet } from "./use-set.ts";

function TestComponent() {
  const { set } = useSet<string>(["a"]);
  return set.has("a") ? "true" : "false";
}

describe(useSet, () => {
  it("renders the initial values on the server", () => {
    const html = renderToString(createElement(TestComponent));

    expect(html).toBe("true");
  });
});
