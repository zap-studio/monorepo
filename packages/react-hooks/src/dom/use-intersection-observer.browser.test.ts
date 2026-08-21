import { act, render, renderHook } from "@testing-library/react";
import { createElement } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  useIntersectionObserver,
  useInView,
  type UseIntersectionObserverResult,
} from "./use-intersection-observer.ts";

class FakeIntersectionObserver implements IntersectionObserver {
  static instances: FakeIntersectionObserver[] = [];
  readonly callback: IntersectionObserverCallback;
  readonly disconnect = vi.fn();
  readonly observe = vi.fn();
  readonly root = null;
  readonly rootMargin = "";
  readonly scrollMargin = "";
  readonly takeRecords = (): IntersectionObserverEntry[] => [];
  readonly thresholds: readonly number[] = [];
  readonly unobserve = vi.fn();

  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback;
    FakeIntersectionObserver.instances.push(this);
  }

  trigger(isIntersecting: boolean): void {
    this.callback([{ isIntersecting } as IntersectionObserverEntry], this);
  }
}

function renderObservedDiv() {
  let latest!: UseIntersectionObserverResult<HTMLDivElement>;
  function TestComponent() {
    latest = useIntersectionObserver<HTMLDivElement>();
    return createElement("div", { ref: latest.ref });
  }
  const { unmount } = render(createElement(TestComponent));
  return {
    get current() {
      return latest;
    },
    unmount,
  };
}

afterEach(() => {
  FakeIntersectionObserver.instances = [];
});

describe(useIntersectionObserver, () => {
  it("starts with inView: false and no entry", () => {
    vi.stubGlobal("IntersectionObserver", FakeIntersectionObserver);
    const div = renderObservedDiv();

    expect(div.current.inView).toBe(false);
    expect(div.current.entry).toBeUndefined();
    vi.unstubAllGlobals();
  });

  it("observes the ref'd element and updates on intersection", () => {
    vi.stubGlobal("IntersectionObserver", FakeIntersectionObserver);
    const div = renderObservedDiv();
    const [observer] = FakeIntersectionObserver.instances;

    expect(observer?.observe).toHaveBeenCalledWith(div.current.ref.current);

    act(() => {
      observer?.trigger(true);
    });

    expect(div.current.inView).toBe(true);
    expect(div.current.entry?.isIntersecting).toBe(true);
    vi.unstubAllGlobals();
  });

  it("does not observe when no element is attached to the ref", () => {
    vi.stubGlobal("IntersectionObserver", FakeIntersectionObserver);

    expect(() => {
      renderHook(() => useIntersectionObserver());
    }).not.toThrow();
    expect(FakeIntersectionObserver.instances).toHaveLength(0);
    vi.unstubAllGlobals();
  });

  it("does not observe when IntersectionObserver is unsupported", () => {
    vi.stubGlobal("IntersectionObserver", undefined);

    expect(() => {
      renderObservedDiv();
    }).not.toThrow();
    vi.unstubAllGlobals();
  });

  it("disconnects the observer on unmount", () => {
    vi.stubGlobal("IntersectionObserver", FakeIntersectionObserver);
    const div = renderObservedDiv();
    const [observer] = FakeIntersectionObserver.instances;

    div.unmount();

    expect(observer?.disconnect).toHaveBeenCalledTimes(1);
    vi.unstubAllGlobals();
  });

  it("exposes useInView as an alias for the same hook", () => {
    expect(useInView).toBe(useIntersectionObserver);
  });
});
