import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { usePermission } from "./use-permission.ts";

function TestComponent() {
  const state = usePermission("geolocation");
  return state === undefined ? "undefined" : state;
}

describe(usePermission, () => {
  it("renders undefined on the server, before the effect can run", () => {
    const html = renderToString(createElement(TestComponent));

    expect(html).toBe("undefined");
  });
});
