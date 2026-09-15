import { describe, expect, it } from "vitest";

import { act, renderHook } from "../../tests/_react.ts";
import { useToggle } from "./use-toggle.ts";

describe("useToggle", () => {
  it("defaults to false", async () => {
    const { result } = await renderHook(() => useToggle());

    expect(result.current[0]).toBe(false);
  });

  it("starts at the given initial value", async () => {
    const { result } = await renderHook(() => useToggle(true));

    expect(result.current[0]).toBe(true);
  });

  it("flips the value on toggle() with no argument", async () => {
    const { result } = await renderHook(() => useToggle(false));

    await act(() => {
      result.current[1]();
    });
    expect(result.current[0]).toBe(true);

    await act(() => {
      result.current[1]();
    });
    expect(result.current[0]).toBe(false);
  });

  it("sets an explicit value when toggle() is called with one", async () => {
    const { result } = await renderHook(() => useToggle(false));

    await act(() => {
      result.current[1](true);
    });
    expect(result.current[0]).toBe(true);

    await act(() => {
      result.current[1](true);
    });
    expect(result.current[0]).toBe(true);
  });
});
