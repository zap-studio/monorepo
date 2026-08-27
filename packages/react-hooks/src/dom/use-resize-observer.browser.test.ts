import { act, render, renderHook } from "@testing-library/react";
import { createElement } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useResizeObserver, type UseResizeObserverResult } from "./use-resize-observer.ts";

class FakeResizeObserver implements ResizeObserver {
  static instances: FakeResizeObserver[] = [];
  readonly callback: ResizeObserverCallback;
  readonly disconnect = vi.fn<() => void>();
  readonly observe = vi.fn<(target: Element) => void>((target: Element) => {
    this.target = target;
  });
  readonly unobserve = vi.fn<(target: Element) => void>();
  target: Element | undefined;

  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
    FakeResizeObserver.instances.push(this);
  }

  trigger(width: number, height: number): void {
    // SAFETY: the hook's observer callback only reads entry.target and
    // entry.contentRect.{height,width}, both of which this fake entry supplies.
    this.callback(
      [{ contentRect: { height, width }, target: this.target } as ResizeObserverEntry],
      this,
    );
  }
}

const renderObservedDiv = () => {
  let latest!: UseResizeObserverResult<HTMLDivElement>;
  const TestComponent = () => {
    latest = useResizeObserver<HTMLDivElement>();
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
  FakeResizeObserver.instances = [];
  vi.unstubAllGlobals();
});

describe("useResizeObserver", () => {
  it("starts with size: undefined", () => {
    vi.stubGlobal("ResizeObserver", FakeResizeObserver);
    const div = renderObservedDiv();

    expect(div.current.size).toBeUndefined();
  });

  it("observes the ref'd element and updates on resize", () => {
    vi.stubGlobal("ResizeObserver", FakeResizeObserver);
    const div = renderObservedDiv();
    const [observer] = FakeResizeObserver.instances;

    expect(observer?.observe).toHaveBeenCalledWith(div.current.ref.current);

    act(() => {
      observer?.trigger(200, 100);
    });

    expect(div.current.size).toEqual({ height: 100, width: 200 });
  });

  it("ignores an entry for a different target", () => {
    vi.stubGlobal("ResizeObserver", FakeResizeObserver);
    const div = renderObservedDiv();
    const [observer] = FakeResizeObserver.instances;

    act(() => {
      // SAFETY: this entry's target is a freshly created <span> that was never
      // passed to observer.observe, so the hook's `observed.target === element`
      // filter drops it; only target and contentRect are read, both provided here.
      observer?.callback(
        [
          { contentRect: { height: 999, width: 999 }, target: document.createElement("span") },
        ] as unknown as ResizeObserverEntry[],
        observer,
      );
    });

    expect(div.current.size).toBeUndefined();
  });

  it("does not observe when no element is attached to the ref", () => {
    vi.stubGlobal("ResizeObserver", FakeResizeObserver);

    expect(() => {
      renderHook(() => useResizeObserver());
    }).not.toThrow();
    expect(FakeResizeObserver.instances).toHaveLength(0);
  });

  it("does not observe when ResizeObserver is unsupported", () => {
    vi.stubGlobal("ResizeObserver", undefined);

    expect(() => {
      renderObservedDiv();
    }).not.toThrow();
  });

  it("disconnects the observer on unmount", () => {
    vi.stubGlobal("ResizeObserver", FakeResizeObserver);
    const div = renderObservedDiv();
    const [observer] = FakeResizeObserver.instances;

    div.unmount();

    expect(observer?.disconnect).toHaveBeenCalledTimes(1);
  });
});

describe("useResizeObserver ref tracking", () => {
  it("observes an element that only attaches after the first render", () => {
    vi.stubGlobal("ResizeObserver", FakeResizeObserver);
    FakeResizeObserver.instances = [];

    let latest!: UseResizeObserverResult<HTMLDivElement>;
    const TestComponent = ({ show }: { show: boolean }) => {
      latest = useResizeObserver<HTMLDivElement>();
      return show ? createElement("div", { ref: latest.ref }) : null;
    };
    const { rerender } = render(createElement(TestComponent, { show: false }));

    expect(FakeResizeObserver.instances).toHaveLength(0);

    rerender(createElement(TestComponent, { show: true }));

    expect(FakeResizeObserver.instances).toHaveLength(1);

    act(() => {
      FakeResizeObserver.instances[0]?.trigger(120, 40);
    });

    expect(latest.size).toEqual({ height: 40, width: 120 });
  });
});
