import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { usePreferredLanguage } from "./use-preferred-language.ts";

const TestComponent = () => {
  const { language, languages } = usePreferredLanguage();
  return `${language},${languages.join(";")}`;
};

describe(usePreferredLanguage, () => {
  it('falls back to "en" on the server, before navigator can be read', () => {
    const html = renderToString(createElement(TestComponent));

    expect(html).toBe("en,en");
  });
});
