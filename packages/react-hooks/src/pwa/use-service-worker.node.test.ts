import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { useServiceWorker } from "./use-service-worker.ts";

function TestComponent() {
  const { supported } = useServiceWorker();
  return supported ? "true" : "false";
}

describe(useServiceWorker, () => {
  it("renders false on the server, before navigator.serviceWorker can be read", () => {
    const html = renderToString(createElement(TestComponent));

    expect(html).toBe("false");
  });
});
