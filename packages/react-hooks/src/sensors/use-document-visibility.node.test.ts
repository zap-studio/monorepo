import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { useDocumentVisibility } from "./use-document-visibility.ts";

const TestComponent = () => {
  return useDocumentVisibility();
};

describe("useDocumentVisibility", () => {
  it('falls back to "visible" on the server, before document can be read', () => {
    const html = renderToString(createElement(TestComponent));

    expect(html).toBe("visible");
  });
});
