import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { useWebTransport } from "./use-web-transport.ts";

function TestComponent() {
  const { status } = useWebTransport(undefined);
  return status;
}

describe(useWebTransport, () => {
  it('renders "closed" on the server when no url is given', () => {
    const html = renderToString(createElement(TestComponent));

    expect(html).toBe("closed");
  });
});
