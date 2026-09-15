import { describe, expect, it } from "vitest";

import { renderHook } from "../../tests/_react.ts";
import { usePrevious } from "./use-previous.ts";

describe("usePrevious", () => {
  it("returns undefined on the first render", async () => {
    const { result } = await renderHook(() => usePrevious(1));

    expect(result.current).toBeUndefined();
  });

  it("returns the value from the previous render after an update", async () => {
    const { result, rerender } = await renderHook(({ value }) => usePrevious(value), {
      initialProps: { value: 1 },
    });

    await rerender({ value: 2 });

    expect(result.current).toBe(1);
  });

  it("tracks each successive previous value across multiple updates", async () => {
    const { result, rerender } = await renderHook(({ value }) => usePrevious(value), {
      initialProps: { value: "a" },
    });

    await rerender({ value: "b" });
    expect(result.current).toBe("a");

    await rerender({ value: "c" });
    expect(result.current).toBe("b");
  });

  it("keeps reporting the last real change once the value stops changing", async () => {
    const { result, rerender } = await renderHook(({ value }) => usePrevious(value), {
      initialProps: { value: 1 },
    });

    await rerender({ value: 2 });
    expect(result.current).toBe(1);

    await rerender({ value: 2 });
    expect(result.current).toBe(2);
  });
});
