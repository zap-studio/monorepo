import { describe, expect, it } from "vitest";

import { act, renderHook } from "../../tests/_react.ts";
import { useQueue } from "./use-queue.ts";

describe("useQueue", () => {
  it("starts empty by default", async () => {
    const { result } = await renderHook(() => useQueue<string>());

    expect(result.current.queue).toEqual([]);
    expect(result.current.first).toBeUndefined();
    expect(result.current.last).toBeUndefined();
  });

  it("starts populated from initialValues", async () => {
    const { result } = await renderHook(() => useQueue<string>(["a", "b"]));

    expect(result.current.queue).toEqual(["a", "b"]);
    expect(result.current.first).toBe("a");
    expect(result.current.last).toBe("b");
  });

  it("enqueue() appends to the back", async () => {
    const { result } = await renderHook(() => useQueue<string>(["a"]));

    await act(() => {
      result.current.enqueue("b");
    });

    expect(result.current.queue).toEqual(["a", "b"]);
    expect(result.current.last).toBe("b");
  });

  it("dequeue() removes and returns the front item", async () => {
    const { result } = await renderHook(() => useQueue<string>(["a", "b"]));

    let dequeued: string | undefined;
    await act(() => {
      dequeued = result.current.dequeue();
    });

    expect(dequeued).toBe("a");
    expect(result.current.queue).toEqual(["b"]);
  });

  it("dequeue() on an empty queue returns undefined", async () => {
    const { result } = await renderHook(() => useQueue<string>());

    let dequeued: string | undefined = "sentinel";
    await act(() => {
      dequeued = result.current.dequeue();
    });

    expect(dequeued).toBeUndefined();
    expect(result.current.queue).toEqual([]);
  });

  it("enqueue() then dequeue() in the same synchronous block sees the just-enqueued item", async () => {
    const { result } = await renderHook(() => useQueue<string>());

    let dequeued: string | undefined;
    await act(() => {
      result.current.enqueue("a");
      dequeued = result.current.dequeue();
    });

    expect(dequeued).toBe("a");
    expect(result.current.queue).toEqual([]);
  });

  it("clear() empties the queue", async () => {
    const { result } = await renderHook(() => useQueue<string>(["a", "b"]));

    await act(() => {
      result.current.clear();
    });

    expect(result.current.queue).toEqual([]);
    expect(result.current.first).toBeUndefined();
    expect(result.current.last).toBeUndefined();
  });
});
