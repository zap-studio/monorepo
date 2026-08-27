import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { usePerformanceObserver } from "./use-performance-observer.ts";

class MockPerformanceObserver {
  static instances: MockPerformanceObserver[] = [];
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
  MockPerformanceObserver.instances = [];
  Object.defineProperty(window, "PerformanceObserver", {
    configurable: true,
    value: MockPerformanceObserver,
  });
};

afterEach(() => {
  Object.defineProperty(window, "PerformanceObserver", { configurable: true, value: undefined });
});

describe("usePerformanceObserver", () => {
  it("reports supported: true when PerformanceObserver exists", () => {
    installMockPerformanceObserver();

    const { result } = renderHook(() =>
      usePerformanceObserver(vi.fn(), { entryTypes: ["longtask"] }),
    );

    expect(result.current.supported).toBe(true);
  });

  it("reports supported: false when PerformanceObserver is unavailable", () => {
    const { result } = renderHook(() =>
      usePerformanceObserver(vi.fn(), { entryTypes: ["longtask"] }),
    );

    expect(result.current.supported).toBe(false);
  });

  it("observes with the given options", () => {
    installMockPerformanceObserver();
    const options = { entryTypes: ["longtask"] };
    renderHook(() => usePerformanceObserver(vi.fn(), options));

    expect(MockPerformanceObserver.instances[0]?.observedOptions).toBe(options);
  });

  it("calls the callback with the entry list and observer", () => {
    installMockPerformanceObserver();
    const callback = vi.fn();
    renderHook(() => usePerformanceObserver(callback, { entryTypes: ["longtask"] }));

    const observer = MockPerformanceObserver.instances[0]!;
    const list = {} as PerformanceObserverEntryList;
    act(() => {
      observer.callback(list, observer as unknown as PerformanceObserver);
    });

    expect(callback).toHaveBeenCalledWith(list, observer);
  });

  it("always calls the latest callback", () => {
    installMockPerformanceObserver();
    const firstCallback = vi.fn();
    const secondCallback = vi.fn();
    const { rerender } = renderHook(
      ({ callback }) => usePerformanceObserver(callback, { entryTypes: ["longtask"] }),
      { initialProps: { callback: firstCallback } },
    );

    rerender({ callback: secondCallback });
    const observer = MockPerformanceObserver.instances[0]!;
    act(() => {
      observer.callback(
        {} as PerformanceObserverEntryList,
        observer as unknown as PerformanceObserver,
      );
    });

    expect(firstCallback).not.toHaveBeenCalled();
    expect(secondCallback).toHaveBeenCalledTimes(1);
  });

  it("disconnects the observer on unmount", () => {
    installMockPerformanceObserver();
    const { unmount } = renderHook(() =>
      usePerformanceObserver(vi.fn(), { entryTypes: ["longtask"] }),
    );

    unmount();

    expect(MockPerformanceObserver.instances[0]?.disconnected).toBe(true);
  });
});

describe("usePerformanceObserver option stability", () => {
  it("does not rebuild the observer for an options object re-created every render", () => {
    vi.stubGlobal("PerformanceObserver", MockPerformanceObserver);
    MockPerformanceObserver.instances = [];

    const { rerender } = renderHook(() =>
      usePerformanceObserver(() => {}, { buffered: true, entryTypes: ["mark"] }),
    );

    expect(MockPerformanceObserver.instances).toHaveLength(1);

    rerender();
    rerender();

    expect(MockPerformanceObserver.instances).toHaveLength(1);
  });

  it("rebuilds the observer when an option actually changes", () => {
    vi.stubGlobal("PerformanceObserver", MockPerformanceObserver);
    MockPerformanceObserver.instances = [];

    const { rerender } = renderHook(
      ({ type }: { type: string }) => usePerformanceObserver(() => {}, { type }),
      { initialProps: { type: "mark" } },
    );

    expect(MockPerformanceObserver.instances).toHaveLength(1);

    rerender({ type: "measure" });

    expect(MockPerformanceObserver.instances).toHaveLength(2);
    expect(MockPerformanceObserver.instances[0]?.disconnected).toBe(true);
  });
});
