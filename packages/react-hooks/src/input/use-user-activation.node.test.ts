import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { useUserActivation } from "./use-user-activation.ts";

const TestComponent = () => {
  const { isActive } = useUserActivation();
  return isActive ? "true" : "false";
};

describe("useUserActivation", () => {
  it("renders false on the server, before navigator.userActivation can be read", () => {
    const html = renderToString(createElement(TestComponent));

    expect(html).toBe("false");
  });
});
