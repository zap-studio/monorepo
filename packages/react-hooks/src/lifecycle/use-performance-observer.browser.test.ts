import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { usePerformanceObserver } from "./use-performance-observer.ts";

// SAFETY: one place to cast test doubles and fake fixtures to a type they do not
// fully match. This keeps `as unknown as X` chains out of the test body.
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
    // SAFETY: the wrapper inside usePerformanceObserver (`(list, obs) => callbackRef.current(list, obs)` in use-performance-observer.ts) passes `list` to `callback` by reference and never reads its members. The check below compares `list` by identity, so an empty object is safe here.
    const list = {} as PerformanceObserverEntryList;
    act(() => {
      // SAFETY: `observer` is the MockPerformanceObserver instance the hook built with `new PerformanceObserver(...)`, caught by our mocked global. The wrapper above only passes it on by reference and the check below compares it by identity, so it never needs the real PerformanceObserver members.
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
      // SAFETY: this test only checks which callback ran and how many times, not the argument values, and the wrapper in usePerformanceObserver never reads members of list/obs. So an empty object and the MockPerformanceObserver instance are safe for the two arguments here.
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
