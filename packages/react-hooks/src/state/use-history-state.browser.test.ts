import { describe, expect, it } from "vitest";

import { act, renderHook } from "../../tests/_react.ts";
import { useHistoryState } from "./use-history-state.ts";

describe("useHistoryState", () => {
  it("starts at the initial value with no undo/redo available", async () => {
    const { result } = await renderHook(() => useHistoryState("a"));

    expect(result.current.value).toBe("a");
    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(false);
  });

  it("set() updates the value and enables undo", async () => {
    const { result } = await renderHook(() => useHistoryState("a"));

    await act(() => {
      result.current.set("b");
    });

    expect(result.current.value).toBe("b");
    expect(result.current.canUndo).toBe(true);
  });

  it("set() accepts an updater function", async () => {
    const { result } = await renderHook(() => useHistoryState(1));

    await act(() => {
      result.current.set((prev) => prev + 1);
    });

    expect(result.current.value).toBe(2);
  });

  it("set() clears the redo stack", async () => {
    const { result } = await renderHook(() => useHistoryState("a"));

    await act(() => {
      result.current.set("b");
    });
    await act(() => {
      result.current.undo();
    });
    expect(result.current.canRedo).toBe(true);

    await act(() => {
      result.current.set("c");
    });

    expect(result.current.canRedo).toBe(false);
  });

  it("undo() restores the previous value", async () => {
    const { result } = await renderHook(() => useHistoryState("a"));

    await act(() => {
      result.current.set("b");
    });
    await act(() => {
      result.current.undo();
    });

    expect(result.current.value).toBe("a");
    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(true);
  });

  it("undo() with nothing to undo is a no-op", async () => {
    const { result } = await renderHook(() => useHistoryState("a"));

    await act(() => {
      result.current.undo();
    });

    expect(result.current.value).toBe("a");
  });

  it("redo() re-applies an undone value", async () => {
    const { result } = await renderHook(() => useHistoryState("a"));

    await act(() => {
      result.current.set("b");
    });
    await act(() => {
      result.current.undo();
    });
    await act(() => {
      result.current.redo();
    });

    expect(result.current.value).toBe("b");
    expect(result.current.canRedo).toBe(false);
    expect(result.current.canUndo).toBe(true);
  });

  it("redo() with nothing to redo is a no-op", async () => {
    const { result } = await renderHook(() => useHistoryState("a"));

    await act(() => {
      result.current.redo();
    });

    expect(result.current.value).toBe("a");
  });

  it("reset() replaces the value and clears both stacks", async () => {
    const { result } = await renderHook(() => useHistoryState("a"));

    await act(() => {
      result.current.set("b");
    });
    await act(() => {
      result.current.reset("z");
    });

    expect(result.current.value).toBe("z");
    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(false);
  });

  it("drops the oldest past entry once capacity is reached", async () => {
    const { result } = await renderHook(() => useHistoryState(0, 2));

    await act(() => {
      result.current.set(1);
    });
    await act(() => {
      result.current.set(2);
    });
    await act(() => {
      result.current.set(3);
    });

    await act(() => {
      result.current.undo();
    });
    await act(() => {
      result.current.undo();
    });
    expect(result.current.value).toBe(1);
    expect(result.current.canUndo).toBe(false);
  });
});
