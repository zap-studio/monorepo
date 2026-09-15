import { createElement, useEffect } from "react";
import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import { renderHook } from "../../tests/_react.ts";
import { useOwnerStack } from "./use-owner-stack.ts";

describe("useOwnerStack", () => {
  it("reports supported: true on this React version", async () => {
    const { result } = await renderHook(() => useOwnerStack());

    expect(result.current.supported).toBe(true);
  });

  it("captureOwnerStack() returns a string or undefined without throwing", async () => {
    const { result } = await renderHook(() => useOwnerStack());

    const stack = result.current.captureOwnerStack();

    expect(stack === undefined || typeof stack === "string").toBe(true);
  });

  it("captureOwnerStack() surfaces a null result (no current owner) as undefined", async () => {
    // Calling capture() with no render/commit in progress on this call stack is the "no current owner" case React's own captureOwnerStack returns null for.
    const { result } = await renderHook(() => useOwnerStack());
    const { captureOwnerStack: capture } = result.current;

    expect(capture()).toBeUndefined();
  });

  it("captureOwnerStack() returns a real stack string when called from a rendered owner", async () => {
    let captured: string | undefined;

    const Child = () => {
      const { captureOwnerStack: capture } = useOwnerStack();
      useEffect(() => {
        captured = capture();
      });
      return null;
    };
    const Parent = () => {
      return createElement(Child);
    };

    await render(createElement(Parent));

    expect(typeof captured).toBe("string");
  });
});
