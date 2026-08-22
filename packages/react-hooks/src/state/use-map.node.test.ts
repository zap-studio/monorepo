import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { useMap } from "./use-map.ts";

function TestComponent() {
  const { map } = useMap<string, number>([["a", 1]]);
  return String(map.get("a"));
}

describe(useMap, () => {
  it("renders the initial entries on the server", () => {
    const html = renderToString(createElement(TestComponent));

    expect(html).toBe("1");
  });
});
