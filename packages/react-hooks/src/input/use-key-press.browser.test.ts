import { describe, expect, it, vi } from "vitest";

import { act, renderHook } from "../../tests/_react.ts";
import { useKeyPress } from "./use-key-press.ts";

const dispatchKey = (type: "keydown" | "keyup", key: string) => {
  window.dispatchEvent(new KeyboardEvent(type, { key }));
};

describe("useKeyPress", () => {
  it("starts as false before any key is pressed", async () => {
    const { result } = await renderHook(() => useKeyPress("Shift"));

    expect(result.current).toBe(false);
  });

  it("becomes true when the target key is pressed down", async () => {
    const { result } = await renderHook(() => useKeyPress("Shift"));

    await act(async () => {
      dispatchKey("keydown", "Shift");
    });

    expect(result.current).toBe(true);
  });

  it("becomes false again when the target key is released", async () => {
    const { result } = await renderHook(() => useKeyPress("Shift"));

    await act(async () => {
      dispatchKey("keydown", "Shift");
    });
    await act(async () => {
      dispatchKey("keyup", "Shift");
    });

    expect(result.current).toBe(false);
  });

  it("matches case-insensitively", async () => {
    const { result } = await renderHook(() => useKeyPress("shift"));

    await act(async () => {
      dispatchKey("keydown", "Shift");
    });

    expect(result.current).toBe(true);
  });

  it("ignores keys not in the target list", async () => {
    const { result } = await renderHook(() => useKeyPress("Shift"));

    await act(async () => {
      dispatchKey("keydown", "Control");
    });

    expect(result.current).toBe(false);
  });

  it("accepts an array of target keys, matching any of them", async () => {
    const { result } = await renderHook(() => useKeyPress(["ArrowLeft", "ArrowRight"]));

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
    const { result } = await renderHook(() => useKeyPress("Shift"));

    await act(async () => {
      dispatchKey("keydown", "Shift");
    });
    await act(async () => {
      dispatchKey("keyup", "Control");
    });

    expect(result.current).toBe(true);
  });

  it("unsubscribes on unmount", async () => {
    const { result, unmount } = await renderHook(() => useKeyPress("Shift"));
    await unmount();

    await act(async () => {
      dispatchKey("keydown", "Shift");
    });

    expect(result.current).toBe(false);
  });
});

describe("useKeyPress target stability", () => {
  it("does not resubscribe for an array literal re-created every render", async () => {
    const addEventListener = vi.spyOn(window, "addEventListener");
    const { rerender, result } = await renderHook(() => useKeyPress(["ArrowLeft", "ArrowRight"]));

    const initialCalls = addEventListener.mock.calls.length;
    await rerender();
    await rerender();

    expect(addEventListener.mock.calls).toHaveLength(initialCalls);

    await act(async () => {
      dispatchKey("keydown", "ArrowLeft");
    });

    expect(result.current).toBe(true);
  });

  it("resubscribes when the key list actually changes", async () => {
    const { rerender, result } = await renderHook(
      ({ keys }: { keys: string[] }) => useKeyPress(keys),
      {
        initialProps: { keys: ["a"] },
      },
    );

    await rerender({ keys: ["b"] });
    await act(async () => {
      dispatchKey("keydown", "a");
    });

    expect(result.current).toBe(false);

    await act(async () => {
      dispatchKey("keydown", "b");
    });

    expect(result.current).toBe(true);
    await act(async () => {
      dispatchKey("keyup", "b");
    });
  });
});
