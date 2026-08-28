import { act, render, renderHook } from "@testing-library/react";
import { createElement } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  useIntersectionObserver,
  useInView,
  type UseIntersectionObserverResult,
} from "./use-intersection-observer.ts";

class FakeIntersectionObserver implements IntersectionObserver {
  static readonly instances: FakeIntersectionObserver[] = [];
  readonly callback: IntersectionObserverCallback;
  readonly disconnect = vi.fn<() => void>();
  readonly observe = vi.fn<(target: Element) => void>();
  readonly root = null;
  readonly rootMargin = "";
  readonly scrollMargin = "";
  readonly takeRecords = (): IntersectionObserverEntry[] => [];
  readonly thresholds: readonly number[] = [];
  readonly unobserve = vi.fn<(target: Element) => void>();

  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback;
    FakeIntersectionObserver.instances.push(this);
  }

  trigger(isIntersecting: boolean): void {
    // SAFETY: useIntersectionObserver only ever reads `entry?.isIntersecting` from the entry it receives, and every assertion in this file only checks `entry?.isIntersecting` too, so a partial entry with just that field is all this mock needs.
    this.callback([{ isIntersecting } as IntersectionObserverEntry], this);
  }
}

const renderObservedDiv = () => {
  let latest!: UseIntersectionObserverResult<HTMLDivElement>;
  const TestComponent = () => {
    latest = useIntersectionObserver<HTMLDivElement>();
    return createElement("div", { ref: latest.ref });
  };
  const { unmount } = render(createElement(TestComponent));
  return {
    get current() {
      return latest;
    },
    unmount,
  };
};

afterEach(() => {
  FakeIntersectionObserver.instances.length = 0;
});

describe("useIntersectionObserver", () => {
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

describe("useIntersectionObserver ref and option tracking", () => {
  it("observes an element that only attaches after the first render", () => {
    vi.stubGlobal("IntersectionObserver", FakeIntersectionObserver);

    let latest!: UseIntersectionObserverResult<HTMLDivElement>;
    const TestComponent = ({ show }: { show: boolean }) => {
      latest = useIntersectionObserver<HTMLDivElement>();
      return show ? createElement("div", { ref: latest.ref }) : null;
    };
    const { rerender } = render(createElement(TestComponent, { show: false }));

    expect(FakeIntersectionObserver.instances).toHaveLength(0);

    rerender(createElement(TestComponent, { show: true }));

    expect(FakeIntersectionObserver.instances).toHaveLength(1);

    act(() => {
      FakeIntersectionObserver.instances[0]?.trigger(true);
    });

    expect(latest.inView).toBe(true);
    vi.unstubAllGlobals();
  });

  it("does not rebuild the observer for an options object re-created every render", () => {
    vi.stubGlobal("IntersectionObserver", FakeIntersectionObserver);

    const TestComponent = () => {
      const { ref } = useIntersectionObserver<HTMLDivElement>({
        rootMargin: "10px",
        threshold: 0.5,
      });
      return createElement("div", { ref });
    };
    const { rerender } = render(createElement(TestComponent));

    expect(FakeIntersectionObserver.instances).toHaveLength(1);

    rerender(createElement(TestComponent));
    rerender(createElement(TestComponent));

    expect(FakeIntersectionObserver.instances).toHaveLength(1);
    vi.unstubAllGlobals();
  });

  it("rebuilds the observer when an option changes, including a threshold array", () => {
    vi.stubGlobal("IntersectionObserver", FakeIntersectionObserver);

    const TestComponent = ({ threshold }: { threshold: number[] }) => {
      const { ref } = useIntersectionObserver<HTMLDivElement>({ threshold });
      return createElement("div", { ref });
    };
    const { rerender } = render(createElement(TestComponent, { threshold: [0, 1] }));

    expect(FakeIntersectionObserver.instances).toHaveLength(1);

    rerender(createElement(TestComponent, { threshold: [0, 1] }));

    expect(FakeIntersectionObserver.instances).toHaveLength(1);

    rerender(createElement(TestComponent, { threshold: [0, 0.5, 1] }));

    expect(FakeIntersectionObserver.instances).toHaveLength(2);
    vi.unstubAllGlobals();
  });
});
