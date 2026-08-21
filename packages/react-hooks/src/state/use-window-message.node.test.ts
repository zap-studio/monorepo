import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { useWindowMessage } from "./use-window-message.ts";

function TestComponent() {
  const { lastMessage } = useWindowMessage<string>();
  return lastMessage === undefined ? "undefined" : "defined";
}

describe(useWindowMessage, () => {
  it("renders with no lastMessage on the server", () => {
    const html = renderToString(createElement(TestComponent));

    expect(html).toBe("undefined");
  });
});
