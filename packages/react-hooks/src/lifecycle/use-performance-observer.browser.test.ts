import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { usePerformanceObserver } from "./use-performance-observer.ts";

// SAFETY: single explicit escape hatch for casting test doubles / deliberately
// non-conforming fixtures to a type they don't structurally satisfy, instead of
// scattering `as unknown as X` chains through the test body.
const asTestDouble = <T>(value: unknown): T => value as T;

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
    const callback = vi.fn<PerformanceObserverCallback>();
    renderHook(() => usePerformanceObserver(callback, { entryTypes: ["longtask"] }));

    const observer = MockPerformanceObserver.instances[0]!;
    // SAFETY: usePerformanceObserver's internal callback wrapper (`(list, obs) => callbackRef.current(list, obs)` in use-performance-observer.ts) only forwards `list` by reference to `callback`, never reading its members, and the assertion below checks `list` by identity — so an empty object stand-in is safe.
    const list = {} as PerformanceObserverEntryList;
    act(() => {
      // SAFETY: `observer` is the MockPerformanceObserver instance the hook itself constructed via `new PerformanceObserver(...)` (intercepted by our mocked global); the wrapper above only forwards it by reference and the assertion below compares it by identity, so it never needs to implement the real PerformanceObserver interface.
      observer.callback(list, asTestDouble<PerformanceObserver>(observer));
    });

    expect(callback).toHaveBeenCalledWith(list, observer);
  });

  it("always calls the latest callback", () => {
    installMockPerformanceObserver();
    const firstCallback = vi.fn<PerformanceObserverCallback>();
    const secondCallback = vi.fn<PerformanceObserverCallback>();
    const { rerender } = renderHook(
      ({ callback }) => usePerformanceObserver(callback, { entryTypes: ["longtask"] }),
      { initialProps: { callback: firstCallback } },
    );

    rerender({ callback: secondCallback });
    const observer = MockPerformanceObserver.instances[0]!;
    act(() => {
      // SAFETY: this test only checks which callback fired and how many times, not the argument values, and usePerformanceObserver's wrapper never reads list/obs members — so an empty object and the MockPerformanceObserver instance are safe stand-ins for the two positional arguments here.
      observer.callback(
        {} as PerformanceObserverEntryList,
        asTestDouble<PerformanceObserver>(observer),
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
    MockPerformanceObserver.instances.length = 0;

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
    MockPerformanceObserver.instances.length = 0;

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
