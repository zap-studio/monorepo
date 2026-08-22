import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { useIndexedDB } from "./use-indexed-db.ts";

function TestComponent() {
  const { value } = useIndexedDB("count", 0);
  return String(value);
}

describe(useIndexedDB, () => {
  it("renders the initial value on the server, before the effect can run", () => {
    const html = renderToString(createElement(TestComponent));

    expect(html).toBe("0");
  });
});
