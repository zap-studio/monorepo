import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { asTestDouble } from "../../tests/_test-double.ts";
import { useWorker } from "./use-worker.ts";

class MockWorker extends EventTarget {
  static readonly instances: MockWorker[] = [];
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
  MockWorker.instances.length = 0;
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("useWorker", () => {
  it("run() rejects and never creates a worker when unsupported", async () => {
    reset();
    vi.stubGlobal("Worker", undefined);
    // SAFETY: MockWorker extends EventTarget (add/removeEventListener, dispatchEvent) and has its
    // own postMessage and terminate. These are the only Worker members useWorker's run() and
    // terminate() use. Worker is stubbed as undefined above, so this factory never runs.
    const createWorker = vi.fn<() => Worker>(() => asTestDouble<Worker>(new MockWorker()));
    const { result } = renderHook(() => useWorker(createWorker));

    let error: Error | undefined;
    await act(async () => {
      try {
        await result.current.run("x");
      } catch (caught) {
        // SAFETY: run() has only one rejection path (see use-worker.ts). It rejects with
        // `new Error("Web Workers are not supported by this browser.")`, so caught is an Error.
        error = caught as Error;
      }
    });

    expect(error?.message).toBe("Web Workers are not supported by this browser.");
    expect(createWorker).not.toHaveBeenCalled();
  });

  it("reports supported: true when Worker exists", () => {
    reset();
    // SAFETY: this test only reads result.current.supported, which useWorker gets from
    // `typeof Worker !== "undefined"`. It never calls a method on the created worker, so the rest of
    // the Worker interface that MockWorker does not have (onmessage, dispatchEvent shape) is unused.
    const { result } = renderHook(() => useWorker(() => asTestDouble<Worker>(new MockWorker())));

    expect(result.current.supported).toBe(true);
  });

  it("does not create the worker until the first run() call", () => {
    reset();
    // SAFETY: this test never calls run(), so createWorker never runs and neither does this cast.
    // The check below confirms that.
    const createWorker = vi.fn<() => Worker>(() => asTestDouble<Worker>(new MockWorker()));
    renderHook(() => useWorker(createWorker));

    expect(createWorker).not.toHaveBeenCalled();
  });

  it("run() posts the message and resolves with the response", async () => {
    reset();
    const { result } = renderHook(() =>
      // SAFETY: on the worker it creates, useWorker's run() only calls
      // addEventListener/removeEventListener (from MockWorker's EventTarget base) and postMessage
      // (written on MockWorker), so MockWorker has every Worker member this test path uses.
      useWorker<number, number>(() => asTestDouble<Worker>(new MockWorker())),
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
    // SAFETY: this test sends both run() calls through worker.postMessage and dispatches "message"
    // events read with worker.addEventListener/removeEventListener. MockWorker has all of them:
    // postMessage directly, and the listener methods from its EventTarget base.
    const createWorker = vi.fn<() => Worker>(() => asTestDouble<Worker>(new MockWorker()));
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
    // SAFETY: this test causes the rejection with worker.dispatchEvent(new ErrorEvent(...)), which
    // MockWorker's EventTarget base handles. run()'s handleError listener only reads event.message
    // and calls worker.removeEventListener, and MockWorker has both.
    const { result } = renderHook(() => useWorker(() => asTestDouble<Worker>(new MockWorker())));

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
        // SAFETY: run()'s handleError listener rejects with `new Error(event.message)` (see
        // use-worker.ts), so what this test catches is always an Error.
        error = caught as Error;
      }
    });

    expect(error?.message).toBe("worker crashed");
  });

  it("terminate() terminates the worker so the next run() creates a new one", async () => {
    reset();
    // SAFETY: this test checks worker.terminated after calling result.current.terminate().
    // useWorker runs that as workerRef.current?.terminate(). MockWorker has its own terminate(),
    // which sets this.terminated = true.
    const createWorker = vi.fn<() => Worker>(() => asTestDouble<Worker>(new MockWorker()));
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
      // SAFETY: this test checks worker.terminated after unmount(). That runs useWorker's
      // `useEffect(() => terminate, [terminate])` cleanup, which calls workerRef.current?.terminate().
      // MockWorker has its own terminate().
      useWorker(() => asTestDouble<Worker>(new MockWorker())),
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
