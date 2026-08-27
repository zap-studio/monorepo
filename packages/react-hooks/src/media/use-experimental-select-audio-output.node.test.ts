import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useExperimentalSelectAudioOutput } from "./use-experimental-select-audio-output.ts";

const TestComponent = () => {
  const { supported } = useExperimentalSelectAudioOutput();
  return supported ? "true" : "false";
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("useExperimentalSelectAudioOutput", () => {
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
