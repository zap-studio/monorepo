import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { usePrevious } from "./use-previous.ts";

describe("usePrevious", () => {
  it("returns undefined on the first render", () => {
    const { result } = renderHook(() => usePrevious(1));

    expect(result.current).toBeUndefined();
  });

  it("returns the value from the previous render after an update", () => {
    const { result, rerender } = renderHook(({ value }) => usePrevious(value), {
      initialProps: { value: 1 },
    });

    rerender({ value: 2 });

    expect(result.current).toBe(1);
  });

  it("tracks each successive previous value across multiple updates", () => {
    const { result, rerender } = renderHook(({ value }) => usePrevious(value), {
      initialProps: { value: "a" },
    });

    rerender({ value: "b" });
    expect(result.current).toBe("a");

    rerender({ value: "c" });
    expect(result.current).toBe("b");
  });

  it("keeps reporting the last real change once the value stops changing", () => {
    const { result, rerender } = renderHook(({ value }) => usePrevious(value), {
      initialProps: { value: 1 },
    });

    rerender({ value: 2 });
    expect(result.current).toBe(1);

    rerender({ value: 2 });
    expect(result.current).toBe(2);
  });
});
