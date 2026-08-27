import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { useIsServer } from "./use-is-server.ts";

const TestComponent = () => {
  const isServer = useIsServer();
  return isServer ? "true" : "false";
};

describe(useIsServer, () => {
  it("renders true on the server", () => {
    const html = renderToString(createElement(TestComponent));

    expect(html).toBe("true");
  });
});
