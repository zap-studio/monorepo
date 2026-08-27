import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useHistoryState } from "./use-history-state.ts";

describe("useHistoryState", () => {
  it("starts at the initial value with no undo/redo available", () => {
    const { result } = renderHook(() => useHistoryState("a"));

    expect(result.current.value).toBe("a");
    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(false);
  });

  it("set() updates the value and enables undo", () => {
    const { result } = renderHook(() => useHistoryState("a"));

    act(() => {
      result.current.set("b");
    });

    expect(result.current.value).toBe("b");
    expect(result.current.canUndo).toBe(true);
  });

  it("set() accepts an updater function", () => {
    const { result } = renderHook(() => useHistoryState(1));

    act(() => {
      result.current.set((prev) => prev + 1);
    });

    expect(result.current.value).toBe(2);
  });

  it("set() clears the redo stack", () => {
    const { result } = renderHook(() => useHistoryState("a"));

    act(() => {
      result.current.set("b");
    });
    act(() => {
      result.current.undo();
    });
    expect(result.current.canRedo).toBe(true);

    act(() => {
      result.current.set("c");
    });

    expect(result.current.canRedo).toBe(false);
  });

  it("undo() restores the previous value", () => {
    const { result } = renderHook(() => useHistoryState("a"));

    act(() => {
      result.current.set("b");
    });
    act(() => {
      result.current.undo();
    });

    expect(result.current.value).toBe("a");
    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(true);
  });

  it("undo() with nothing to undo is a no-op", () => {
    const { result } = renderHook(() => useHistoryState("a"));

    act(() => {
      result.current.undo();
    });

    expect(result.current.value).toBe("a");
  });

  it("redo() re-applies an undone value", () => {
    const { result } = renderHook(() => useHistoryState("a"));

    act(() => {
      result.current.set("b");
    });
    act(() => {
      result.current.undo();
    });
    act(() => {
      result.current.redo();
    });

    expect(result.current.value).toBe("b");
    expect(result.current.canRedo).toBe(false);
    expect(result.current.canUndo).toBe(true);
  });

  it("redo() with nothing to redo is a no-op", () => {
    const { result } = renderHook(() => useHistoryState("a"));

    act(() => {
      result.current.redo();
    });

    expect(result.current.value).toBe("a");
  });

  it("reset() replaces the value and clears both stacks", () => {
    const { result } = renderHook(() => useHistoryState("a"));

    act(() => {
      result.current.set("b");
    });
    act(() => {
      result.current.reset("z");
    });

    expect(result.current.value).toBe("z");
    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(false);
  });

  it("drops the oldest past entry once capacity is reached", () => {
    const { result } = renderHook(() => useHistoryState(0, 2));

    act(() => {
      result.current.set(1);
    });
    act(() => {
      result.current.set(2);
    });
    act(() => {
      result.current.set(3);
    });

    act(() => {
      result.current.undo();
    });
    act(() => {
      result.current.undo();
    });
    expect(result.current.value).toBe(1);
    expect(result.current.canUndo).toBe(false);
  });
});
