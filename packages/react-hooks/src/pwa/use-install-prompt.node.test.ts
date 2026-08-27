import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { useInstallPrompt } from "./use-install-prompt.ts";

const TestComponent = () => {
  const { canInstall } = useInstallPrompt();
  return canInstall ? "true" : "false";
};

describe(useInstallPrompt, () => {
  it("renders false on the server, before beforeinstallprompt can fire", () => {
    const html = renderToString(createElement(TestComponent));

    expect(html).toBe("false");
  });
});
