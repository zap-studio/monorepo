import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { useOnlineStatus } from "./use-online-status.ts";

const TestComponent = () => {
  const isOnline = useOnlineStatus();
  return isOnline ? "true" : "false";
};

describe(useOnlineStatus, () => {
  it("renders true on the server, before navigator.onLine can be read", () => {
    const html = renderToString(createElement(TestComponent));

    expect(html).toBe("true");
  });
});
