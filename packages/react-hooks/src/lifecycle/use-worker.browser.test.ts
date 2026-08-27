import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useWorker } from "./use-worker.ts";

class MockWorker extends EventTarget {
  static instances: MockWorker[] = [];
  postedMessages: unknown[] = [];
  terminated = false;

  constructor() {
    super();
    MockWorker.instances.push(this);
  }

  postMessage(message: unknown) {
    this.postedMessages.push(message);
  }

  terminate() {
    this.terminated = true;
  }
}

const reset = () => {
  MockWorker.instances = [];
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe(useWorker, () => {
  it("run() rejects and never creates a worker when unsupported", async () => {
    reset();
    vi.stubGlobal("Worker", undefined);
    const createWorker = vi.fn(() => new MockWorker() as unknown as Worker);
    const { result } = renderHook(() => useWorker(createWorker));

    let error: Error | undefined;
    await act(async () => {
      try {
        await result.current.run("x");
      } catch (caught) {
        error = caught as Error;
      }
    });

    expect(error?.message).toBe("Web Workers are not supported by this browser.");
    expect(createWorker).not.toHaveBeenCalled();
  });

  it("reports supported: true when Worker exists", () => {
    reset();
    const { result } = renderHook(() => useWorker(() => new MockWorker() as unknown as Worker));

    expect(result.current.supported).toBe(true);
  });

  it("does not create the worker until the first run() call", () => {
    reset();
    const createWorker = vi.fn(() => new MockWorker() as unknown as Worker);
    renderHook(() => useWorker(createWorker));

    expect(createWorker).not.toHaveBeenCalled();
  });

  it("run() posts the message and resolves with the response", async () => {
    reset();
    const { result } = renderHook(() =>
      useWorker<number, number>(() => new MockWorker() as unknown as Worker),
    );

    let responsePromise!: Promise<number>;
    act(() => {
      responsePromise = result.current.run(21);
    });

    const worker = MockWorker.instances[0]!;
    expect(worker.postedMessages).toEqual([21]);

    let response = 0;
    await act(async () => {
      worker.dispatchEvent(new MessageEvent("message", { data: 42 }));
      response = await responsePromise;
    });

    expect(response).toBe(42);
  });

  it("reuses the same worker across multiple run() calls", async () => {
    reset();
    const createWorker = vi.fn(() => new MockWorker() as unknown as Worker);
    const { result } = renderHook(() => useWorker<number, number>(createWorker));

    let firstPromise!: Promise<number>;
    act(() => {
      firstPromise = result.current.run(1);
    });
    await act(async () => {
      MockWorker.instances[0]!.dispatchEvent(new MessageEvent("message", { data: 2 }));
      await firstPromise;
    });

    let secondPromise!: Promise<number>;
    act(() => {
      secondPromise = result.current.run(3);
    });
    await act(async () => {
      MockWorker.instances[0]!.dispatchEvent(new MessageEvent("message", { data: 4 }));
      await secondPromise;
    });

    expect(createWorker).toHaveBeenCalledTimes(1);
  });

  it("run() rejects when the worker fires an error event", async () => {
    reset();
    const { result } = renderHook(() => useWorker(() => new MockWorker() as unknown as Worker));

    let runPromise!: Promise<unknown>;
    act(() => {
      runPromise = result.current.run("x");
    });

    let error: Error | undefined;
    await act(async () => {
      MockWorker.instances[0]!.dispatchEvent(
        new ErrorEvent("error", { message: "worker crashed" }),
      );
      try {
        await runPromise;
      } catch (caught) {
        error = caught as Error;
      }
    });

    expect(error?.message).toBe("worker crashed");
  });

  it("terminate() terminates the worker so the next run() creates a new one", async () => {
    reset();
    const createWorker = vi.fn(() => new MockWorker() as unknown as Worker);
    const { result } = renderHook(() => useWorker<number, number>(createWorker));

    let firstPromise!: Promise<number>;
    act(() => {
      firstPromise = result.current.run(1);
    });
    await act(async () => {
      MockWorker.instances[0]!.dispatchEvent(new MessageEvent("message", { data: 1 }));
      await firstPromise;
    });

    act(() => {
      result.current.terminate();
    });
    expect(MockWorker.instances[0]?.terminated).toBe(true);

    let secondPromise!: Promise<number>;
    act(() => {
      secondPromise = result.current.run(2);
    });
    await act(async () => {
      MockWorker.instances[1]!.dispatchEvent(new MessageEvent("message", { data: 2 }));
      await secondPromise;
    });

    expect(createWorker).toHaveBeenCalledTimes(2);
  });

  it("terminates the worker on unmount", async () => {
    reset();
    const { result, unmount } = renderHook(() =>
      useWorker(() => new MockWorker() as unknown as Worker),
    );

    let runPromise!: Promise<unknown>;
    act(() => {
      runPromise = result.current.run("x");
    });
    await act(async () => {
      MockWorker.instances[0]!.dispatchEvent(new MessageEvent("message", { data: "y" }));
      await runPromise;
    });

    unmount();

    expect(MockWorker.instances[0]?.terminated).toBe(true);
  });
});
