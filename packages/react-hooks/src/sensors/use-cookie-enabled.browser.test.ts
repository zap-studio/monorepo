import { describe, expect, it } from "vitest";

import { renderHook } from "../../tests/_react.ts";
import { useCookieEnabled } from "./use-cookie-enabled.ts";

const setCookieEnabled = (value: boolean) => {
  Object.defineProperty(navigator, "cookieEnabled", { configurable: true, value });
};

describe("useCookieEnabled", () => {
  it("is true when navigator.cookieEnabled is true", async () => {
    setCookieEnabled(true);

    const { result, unmount } = await renderHook(() => useCookieEnabled());

    expect(result.current).toBe(true);
    await unmount();
  });

  it("is false when navigator.cookieEnabled is false", async () => {
    setCookieEnabled(false);

    const { result } = await renderHook(() => useCookieEnabled());

    expect(result.current).toBe(false);
  });
});
