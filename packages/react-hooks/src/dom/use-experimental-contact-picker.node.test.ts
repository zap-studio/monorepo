import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useExperimentalContactPicker } from "./use-experimental-contact-picker.ts";

const TestComponent = () => {
  const { supported } = useExperimentalContactPicker();
  return supported ? "true" : "false";
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe(useExperimentalContactPicker, () => {
  it("renders supported: false on the server", () => {
    const html = renderToString(createElement(TestComponent));

    expect(html).toBe("false");
  });

  it("renders supported: false when navigator itself doesn't exist", () => {
    vi.stubGlobal("navigator", undefined);

    const html = renderToString(createElement(TestComponent));

    expect(html).toBe("false");
  });
});
