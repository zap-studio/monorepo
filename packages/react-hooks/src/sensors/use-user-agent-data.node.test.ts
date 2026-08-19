import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { useUserAgentData } from "./use-user-agent-data.ts";

function TestComponent() {
  const uaData = useUserAgentData();
  return uaData === undefined ? "undefined" : "defined";
}

describe(useUserAgentData, () => {
  it("renders undefined on the server, before navigator can be read", () => {
    const html = renderToString(createElement(TestComponent));

    expect(html).toBe("undefined");
  });
});
