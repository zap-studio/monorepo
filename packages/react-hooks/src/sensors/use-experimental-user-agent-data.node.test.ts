import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { useExperimentalUserAgentData } from "./use-experimental-user-agent-data.ts";

const TestComponent = () => {
  const uaData = useExperimentalUserAgentData();
  return uaData === undefined ? "undefined" : "defined";
};

describe(useExperimentalUserAgentData, () => {
  it("renders undefined on the server, before navigator can be read", () => {
    const html = renderToString(createElement(TestComponent));

    expect(html).toBe("undefined");
  });
});
