import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { useNavigation } from "./use-navigation.ts";

function TestComponent() {
  const { canGoBack, currentEntry, entries } = useNavigation();
  return `${canGoBack},${currentEntry === null ? "null" : "defined"},${entries.length}`;
}

describe(useNavigation, () => {
  it("falls back to the empty snapshot on the server", () => {
    const html = renderToString(createElement(TestComponent));

    expect(html).toBe("false,null,0");
  });
});
