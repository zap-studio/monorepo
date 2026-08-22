import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useKeyPress } from "./use-key-press.ts";

function dispatchKey(type: "keydown" | "keyup", key: string) {
  window.dispatchEvent(new KeyboardEvent(type, { key }));
}

describe(useKeyPress, () => {
  it("starts as false before any key is pressed", () => {
    const { result } = renderHook(() => useKeyPress("Shift"));

    expect(result.current).toBe(false);
  });

  it("becomes true when the target key is pressed down", async () => {
    const { result } = renderHook(() => useKeyPress("Shift"));

    await act(async () => {
      dispatchKey("keydown", "Shift");
    });

    expect(result.current).toBe(true);
  });

  it("becomes false again when the target key is released", async () => {
    const { result } = renderHook(() => useKeyPress("Shift"));

    await act(async () => {
      dispatchKey("keydown", "Shift");
    });
    await act(async () => {
      dispatchKey("keyup", "Shift");
    });

    expect(result.current).toBe(false);
  });

  it("matches case-insensitively", async () => {
    const { result } = renderHook(() => useKeyPress("shift"));

    await act(async () => {
      dispatchKey("keydown", "Shift");
    });

    expect(result.current).toBe(true);
  });

  it("ignores keys not in the target list", async () => {
    const { result } = renderHook(() => useKeyPress("Shift"));

    await act(async () => {
      dispatchKey("keydown", "Control");
    });

    expect(result.current).toBe(false);
  });

  it("accepts an array of target keys, matching any of them", async () => {
    const { result } = renderHook(() => useKeyPress(["ArrowLeft", "ArrowRight"]));

    await act(async () => {
      dispatchKey("keydown", "ArrowRight");
    });

    expect(result.current).toBe(true);

    await act(async () => {
      dispatchKey("keyup", "ArrowRight");
    });

    expect(result.current).toBe(false);
  });

  it("ignores keyup for keys not in the target list", async () => {
    const { result } = renderHook(() => useKeyPress("Shift"));

    await act(async () => {
      dispatchKey("keydown", "Shift");
    });
    await act(async () => {
      dispatchKey("keyup", "Control");
    });

    expect(result.current).toBe(true);
  });

  it("unsubscribes on unmount", async () => {
    const { result, unmount } = renderHook(() => useKeyPress("Shift"));
    unmount();

    await act(async () => {
      dispatchKey("keydown", "Shift");
    });

    expect(result.current).toBe(false);
  });
});
