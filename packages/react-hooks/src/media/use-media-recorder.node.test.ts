import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { useMediaRecorder } from "./use-media-recorder.ts";

const TestComponent = () => {
  const { supported } = useMediaRecorder(undefined);
  return supported ? "true" : "false";
};

describe("useMediaRecorder", () => {
  it("renders false on the server, before MediaRecorder can be read", () => {
    const html = renderToString(createElement(TestComponent));

    expect(html).toBe("false");
  });
});
