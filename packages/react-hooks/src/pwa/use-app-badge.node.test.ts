import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { useAppBadge } from "./use-app-badge.ts";

const TestComponent = () => {
  const { supported } = useAppBadge();
  return supported ? "true" : "false";
};

describe("useAppBadge", () => {
  it("renders false on the server, before navigator.setAppBadge can be read", () => {
    const html = renderToString(createElement(TestComponent));

    expect(html).toBe("false");
  });
});
