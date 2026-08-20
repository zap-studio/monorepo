import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { useWebSocket } from "./use-web-socket.ts";

function TestComponent() {
  const { status } = useWebSocket(undefined);
  return status;
}

describe(useWebSocket, () => {
  it('renders "closed" on the server when no url is given', () => {
    const html = renderToString(createElement(TestComponent));

    expect(html).toBe("closed");
  });
});
