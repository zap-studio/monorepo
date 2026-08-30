import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useCookieEnabled } from "./use-cookie-enabled.ts";

const setCookieEnabled = (value: boolean) => {
  Object.defineProperty(navigator, "cookieEnabled", { configurable: true, value });
};

describe("useCookieEnabled", () => {
  it("is true when navigator.cookieEnabled is true", () => {
    setCookieEnabled(true);

    const { result, unmount } = renderHook(() => useCookieEnabled());

    expect(result.current).toBe(true);
    unmount();
  });

  it("is false when navigator.cookieEnabled is false", () => {
    setCookieEnabled(false);

    const { result } = renderHook(() => useCookieEnabled());

    expect(result.current).toBe(false);
  });
});
