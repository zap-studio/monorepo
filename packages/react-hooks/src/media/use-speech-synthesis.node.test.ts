import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { useSpeechSynthesis } from "./use-speech-synthesis.ts";

function TestComponent() {
  const { supported } = useSpeechSynthesis();
  return supported ? "true" : "false";
}

describe(useSpeechSynthesis, () => {
  it("renders false on the server, before window.speechSynthesis can be read", () => {
    const html = renderToString(createElement(TestComponent));

    expect(html).toBe("false");
  });
});
