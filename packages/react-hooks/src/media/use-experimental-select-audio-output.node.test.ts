import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { useExperimentalSelectAudioOutput } from "./use-experimental-select-audio-output.ts";

function TestComponent() {
  const { supported } = useExperimentalSelectAudioOutput();
  return supported ? "true" : "false";
}

describe(useExperimentalSelectAudioOutput, () => {
  it("renders supported: false on the server", () => {
    const html = renderToString(createElement(TestComponent));

    expect(html).toBe("false");
  });
});
