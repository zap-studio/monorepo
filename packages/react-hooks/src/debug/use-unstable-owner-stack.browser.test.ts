import { render, renderHook } from "@testing-library/react";
import { createElement, useEffect } from "react";
import { describe, expect, it } from "vitest";

import { useUnstableOwnerStack } from "./use-unstable-owner-stack.ts";

describe(useUnstableOwnerStack, () => {
  it("reports supported: true on this React version", () => {
    const { result } = renderHook(() => useUnstableOwnerStack());

    expect(result.current.supported).toBe(true);
  });

  it("captureOwnerStack() returns a string or undefined without throwing", () => {
    const { result } = renderHook(() => useUnstableOwnerStack());

    const stack = result.current.captureOwnerStack();

    expect(stack === undefined || typeof stack === "string").toBe(true);
  });

  it("captureOwnerStack() surfaces a null result (no current owner) as undefined", () => {
    // Calling capture() with no render/commit in progress on this call stack is the "no current owner" case React's own captureOwnerStack returns null for.
    const { result } = renderHook(() => useUnstableOwnerStack());
    const { captureOwnerStack: capture } = result.current;

    expect(capture()).toBeUndefined();
  });

  it("captureOwnerStack() returns a real stack string when called from a rendered owner", () => {
    let captured: string | undefined;

    function Child() {
      const { captureOwnerStack: capture } = useUnstableOwnerStack();
      useEffect(() => {
        captured = capture();
      });
      return null;
    }
    function Parent() {
      return createElement(Child);
    }

    render(createElement(Parent));

    expect(typeof captured).toBe("string");
  });
});
