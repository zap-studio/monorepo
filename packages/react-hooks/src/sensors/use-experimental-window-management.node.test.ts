import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { useExperimentalWindowManagement } from "./use-experimental-window-management.ts";

const TestComponent = () => {
  const { isExtended, supported } = useExperimentalWindowManagement();
  return `${supported}-${isExtended}`;
};

describe(useExperimentalWindowManagement, () => {
  it("renders supported: false and isExtended: false on the server", () => {
    const html = renderToString(createElement(TestComponent));

    expect(html).toBe("false-false");
  });
});
