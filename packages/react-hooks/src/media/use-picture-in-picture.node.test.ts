import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { usePictureInPicture } from "./use-picture-in-picture.ts";

const TestComponent = () => {
  const { active } = usePictureInPicture();
  return active ? "true" : "false";
};

describe("usePictureInPicture", () => {
  it("renders false on the server, before pictureinpicture events can fire", () => {
    const html = renderToString(createElement(TestComponent));

    expect(html).toBe("false");
  });
});
