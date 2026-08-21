import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { useBroadcastChannel } from "./use-broadcast-channel.ts";

function TestComponent() {
  const { lastMessage } = useBroadcastChannel<string>("test-channel");
  return lastMessage === undefined ? "undefined" : lastMessage;
}

describe(useBroadcastChannel, () => {
  it("renders with no lastMessage on the server", () => {
    const html = renderToString(createElement(TestComponent));

    expect(html).toBe("undefined");
  });
});
