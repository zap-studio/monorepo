import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { useNetworkState } from "./use-network-state.ts";

const TestComponent = () => {
  const state = useNetworkState();
  return [state.online, state.effectiveType, state.downlink, state.rtt, state.saveData].join(",");
};

describe(useNetworkState, () => {
  it("renders online:true with undefined connection fields on the server", () => {
    const html = renderToString(createElement(TestComponent));

    expect(html).toBe("true,,,,");
  });
});
