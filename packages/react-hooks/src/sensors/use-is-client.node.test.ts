import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { useIsClient } from "./use-is-client.ts";

function TestComponent() {
  const isClient = useIsClient();
  return isClient ? "true" : "false";
}

describe(useIsClient, () => {
  it("renders false on the server, before the client has mounted", () => {
    const html = renderToString(createElement(TestComponent));

    expect(html).toBe("false");
  });
});
