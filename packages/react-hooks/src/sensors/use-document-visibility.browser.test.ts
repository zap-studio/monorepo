import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useDocumentVisibility } from "./use-document-visibility.ts";

const setDocumentVisibility = (state: DocumentVisibilityState) => {
  Object.defineProperty(document, "visibilityState", {
    configurable: true,
    get: () => state,
  });
};

describe("useDocumentVisibility", () => {
  it("reports the current document.visibilityState", () => {
    setDocumentVisibility("hidden");

    const { result } = renderHook(() => useDocumentVisibility());

    expect(result.current).toBe("hidden");
  });

  it("updates when the visibilitychange event fires", async () => {
    setDocumentVisibility("visible");
    const { result } = renderHook(() => useDocumentVisibility());
    expect(result.current).toBe("visible");

    await act(async () => {
      setDocumentVisibility("hidden");
      document.dispatchEvent(new Event("visibilitychange"));
    });

    expect(result.current).toBe("hidden");
  });
});
