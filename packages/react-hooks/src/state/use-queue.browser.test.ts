import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useQueue } from "./use-queue.ts";

describe("useQueue", () => {
  it("starts empty by default", () => {
    const { result } = renderHook(() => useQueue<string>());

    expect(result.current.queue).toEqual([]);
    expect(result.current.first).toBeUndefined();
    expect(result.current.last).toBeUndefined();
  });

  it("starts populated from initialValues", () => {
    const { result } = renderHook(() => useQueue<string>(["a", "b"]));

    expect(result.current.queue).toEqual(["a", "b"]);
    expect(result.current.first).toBe("a");
    expect(result.current.last).toBe("b");
  });

  it("enqueue() appends to the back", () => {
    const { result } = renderHook(() => useQueue<string>(["a"]));

    act(() => {
      result.current.enqueue("b");
    });

    expect(result.current.queue).toEqual(["a", "b"]);
    expect(result.current.last).toBe("b");
  });

  it("dequeue() removes and returns the front item", () => {
    const { result } = renderHook(() => useQueue<string>(["a", "b"]));

    let dequeued: string | undefined;
    act(() => {
      dequeued = result.current.dequeue();
    });

    expect(dequeued).toBe("a");
    expect(result.current.queue).toEqual(["b"]);
  });

  it("dequeue() on an empty queue returns undefined", () => {
    const { result } = renderHook(() => useQueue<string>());

    let dequeued: string | undefined = "sentinel";
    act(() => {
      dequeued = result.current.dequeue();
    });

    expect(dequeued).toBeUndefined();
    expect(result.current.queue).toEqual([]);
  });

  it("enqueue() then dequeue() in the same synchronous block sees the just-enqueued item", () => {
    const { result } = renderHook(() => useQueue<string>());

    let dequeued: string | undefined;
    act(() => {
      result.current.enqueue("a");
      dequeued = result.current.dequeue();
    });

    expect(dequeued).toBe("a");
    expect(result.current.queue).toEqual([]);
  });

  it("clear() empties the queue", () => {
    const { result } = renderHook(() => useQueue<string>(["a", "b"]));

    act(() => {
      result.current.clear();
    });

    expect(result.current.queue).toEqual([]);
    expect(result.current.first).toBeUndefined();
    expect(result.current.last).toBeUndefined();
  });
});
