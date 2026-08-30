import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { useSpeechRecognition } from "./use-speech-recognition.ts";

const TestComponent = () => {
  const { supported } = useSpeechRecognition();
  return supported ? "true" : "false";
};

describe("useSpeechRecognition", () => {
  it("renders false on the server, before SpeechRecognition can be read", () => {
    const html = renderToString(createElement(TestComponent));

    expect(html).toBe("false");
  });
});
