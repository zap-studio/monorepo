import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { usePreferredLanguage } from "./use-preferred-language.ts";

const setNavigatorLanguage = (language: string, languages: readonly string[]) => {
  Object.defineProperty(navigator, "language", {
    configurable: true,
    get: () => language,
  });
  Object.defineProperty(navigator, "languages", {
    configurable: true,
    get: () => languages,
  });
};

describe("usePreferredLanguage", () => {
  it("reports navigator.language and navigator.languages", () => {
    setNavigatorLanguage("fr-FR", ["fr-FR", "en-US"]);

    const { result } = renderHook(() => usePreferredLanguage());

    expect(result.current).toEqual({ language: "fr-FR", languages: ["fr-FR", "en-US"] });
  });

  it("updates when the languagechange event fires", async () => {
    setNavigatorLanguage("en-US", ["en-US"]);
    const { result } = renderHook(() => usePreferredLanguage());
    expect(result.current.language).toBe("en-US");

    await act(async () => {
      setNavigatorLanguage("de-DE", ["de-DE"]);
      window.dispatchEvent(new Event("languagechange"));
    });

    expect(result.current).toEqual({ language: "de-DE", languages: ["de-DE"] });
  });
});
