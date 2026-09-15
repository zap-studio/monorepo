import { afterEach, describe, expect, it, vi } from "vitest";

import { act, renderHook } from "../../tests/_react.ts";
import { asTestDouble } from "../../tests/_test-double.ts";
import { usePerformanceObserver } from "./use-performance-observer.ts";

class MockPerformanceObserver {
  static readonly instances: MockPerformanceObserver[] = [];
  disconnected = false;
  observedOptions: PerformanceObserverInit | undefined;
  readonly callback: PerformanceObserverCallback;

  constructor(callback: PerformanceObserverCallback) {
    this.callback = callback;
    MockPerformanceObserver.instances.push(this);
  }

  disconnect() {
    this.disconnected = true;
  }

  observe(options: PerformanceObserverInit) {
    this.observedOptions = options;
  }
}

const installMockPerformanceObserver = () => {
  MockPerformanceObserver.instances.length = 0;
  Object.defineProperty(window, "PerformanceObserver", {
    configurable: true,
    value: MockPerformanceObserver,
  });
};

afterEach(() => {
  Reflect.deleteProperty(window, "PerformanceObserver");
});

describe("usePerformanceObserver", () => {
  it("reports supported: true when PerformanceObserver exists", async () => {
    installMockPerformanceObserver();

    const { result } = await renderHook(() =>
      usePerformanceObserver(vi.fn(), { entryTypes: ["longtask"] }),
    );

    expect(result.current.supported).toBe(true);
  });

  it("reports supported: false when PerformanceObserver is unavailable", async () => {
    const { result } = await renderHook(() =>
      usePerformanceObserver(vi.fn(), { entryTypes: ["longtask"] }),
    );

    expect(result.current.supported).toBe(false);
  });

  it("observes with the given options", async () => {
    installMockPerformanceObserver();
    const options = { entryTypes: ["longtask"] };
    await renderHook(() => usePerformanceObserver(vi.fn(), options));

    expect(MockPerformanceObserver.instances[0]?.observedOptions).toBe(options);
  });

  it("calls the callback with the entry list and observer", async () => {
    installMockPerformanceObserver();
    const callback = vi.fn<PerformanceObserverCallback>();
    await renderHook(() => usePerformanceObserver(callback, { entryTypes: ["longtask"] }));

    const observer = MockPerformanceObserver.instances[0]!;
    const list = asTestDouble<PerformanceObserverEntryList>({});
    await act(() => {
      observer.callback(list, asTestDouble<PerformanceObserver>(observer));
    });

    expect(callback).toHaveBeenCalledWith(list, observer);
  });

  it("always calls the latest callback", async () => {
    installMockPerformanceObserver();
    const firstCallback = vi.fn<PerformanceObserverCallback>();
    const secondCallback = vi.fn<PerformanceObserverCallback>();
    const { rerender } = await renderHook(
      ({ callback }) => usePerformanceObserver(callback, { entryTypes: ["longtask"] }),
      { initialProps: { callback: firstCallback } },
    );

    await rerender({ callback: secondCallback });
    const observer = MockPerformanceObserver.instances[0]!;
    await act(() => {
      observer.callback(
        asTestDouble<PerformanceObserverEntryList>({}),
        asTestDouble<PerformanceObserver>(observer),
      );
    });

    expect(firstCallback).not.toHaveBeenCalled();
    expect(secondCallback).toHaveBeenCalledTimes(1);
  });

  it("disconnects the observer on unmount", async () => {
    installMockPerformanceObserver();
    const { unmount } = await renderHook(() =>
      usePerformanceObserver(vi.fn(), { entryTypes: ["longtask"] }),
    );

    await unmount();

    expect(MockPerformanceObserver.instances[0]?.disconnected).toBe(true);
  });
});

describe("usePerformanceObserver option stability", () => {
  it("does not rebuild the observer for an options object re-created every render", async () => {
    vi.stubGlobal("PerformanceObserver", MockPerformanceObserver);
    MockPerformanceObserver.instances.length = 0;

    const { rerender } = await renderHook(() =>
      usePerformanceObserver(() => {}, { buffered: true, entryTypes: ["mark"] }),
    );

    expect(MockPerformanceObserver.instances).toHaveLength(1);

    await rerender();
    await rerender();

    expect(MockPerformanceObserver.instances).toHaveLength(1);
  });

  it("rebuilds the observer when an option actually changes", async () => {
    vi.stubGlobal("PerformanceObserver", MockPerformanceObserver);
    MockPerformanceObserver.instances.length = 0;

    const { rerender } = await renderHook(
      ({ type }: { type: string }) => usePerformanceObserver(() => {}, { type }),
      { initialProps: { type: "mark" } },
    );

    expect(MockPerformanceObserver.instances).toHaveLength(1);

    await rerender({ type: "measure" });

    expect(MockPerformanceObserver.instances).toHaveLength(2);
    expect(MockPerformanceObserver.instances[0]?.disconnected).toBe(true);
  });
});
