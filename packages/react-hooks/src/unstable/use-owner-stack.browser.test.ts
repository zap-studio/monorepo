import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useOwnerStack } from "./use-owner-stack.ts";

describe(useOwnerStack, () => {
  it("reports supported: true on this React version", () => {
    const { result } = renderHook(() => useOwnerStack());

    expect(result.current.supported).toBe(true);
  });

  it("captureOwnerStack() returns a string or undefined without throwing", () => {
    const { result } = renderHook(() => useOwnerStack());

    const stack = result.current.captureOwnerStack();

    expect(stack === undefined || typeof stack === "string").toBe(true);
  });
});
