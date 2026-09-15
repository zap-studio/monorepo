import { createElement } from "react";
import { describe, expect, it, vi } from "vitest";
import { render } from "vitest-browser-react";

import { renderHook } from "../../tests/_react.ts";
import { useMutationObserver } from "./use-mutation-observer.ts";

/** Holds the ref'd element so reading it later is not narrowed away by control-flow analysis. */
interface CapturedElement {
  element: HTMLDivElement | null;
}

interface MutableBox {
  current: HTMLDivElement | null;
}

const renderObservedDiv = async (callback: (mutations: MutationRecord[]) => void) => {
  let element: HTMLDivElement | null = null;
  const TestComponent = () => {
    const ref = useMutationObserver<HTMLDivElement>(callback);
    return createElement("div", {
      ref: (node: HTMLDivElement | null) => {
        element = node;
        ref.current = node;
      },
    });
  };
  const { unmount } = await render(createElement(TestComponent));
  return {
    get element() {
      return element;
    },
    unmount,
  };
};

describe("useMutationObserver", () => {
  it("calls the callback when an attribute changes on the ref'd element", async () => {
    const callback = vi.fn<(mutations: MutationRecord[]) => void>();
    const div = await renderObservedDiv(callback);

    div.element?.setAttribute("data-test", "1");

    await vi.waitFor(() => expect(callback).toHaveBeenCalled());
    const [mutations] = callback.mock.calls[0] ?? [];
    expect(mutations?.[0]?.attributeName).toBe("data-test");
  });

  it("calls the latest callback without re-subscribing", async () => {
    const first = vi.fn<(mutations: MutationRecord[]) => void>();
    const second = vi.fn<(mutations: MutationRecord[]) => void>();
    const box: MutableBox = { current: null };
    const TestComponent = ({ callback }: { callback: (mutations: MutationRecord[]) => void }) => {
      const ref = useMutationObserver<HTMLDivElement>(callback);
      return createElement("div", {
        ref: (node: HTMLDivElement | null) => {
          box.current = node;
          ref.current = node;
        },
      });
    };
    const { rerender } = await render(createElement(TestComponent, { callback: first }));

    await rerender(createElement(TestComponent, { callback: second }));
    box.current?.setAttribute("data-test", "1");

    await vi.waitFor(() => expect(second).toHaveBeenCalled());
    expect(first).not.toHaveBeenCalled();
  });

  it("does not observe when no element is attached to the ref", () => {
    expect(async () => {
      await renderHook(() => useMutationObserver(() => {}));
    }).not.toThrow();
  });

  it("does not observe when MutationObserver is unsupported", () => {
    vi.stubGlobal("MutationObserver", undefined);

    expect(async () => {
      await renderObservedDiv(() => {});
    }).not.toThrow();

    vi.unstubAllGlobals();
  });

  it("disconnects the observer on unmount", async () => {
    const callback = vi.fn<(mutations: MutationRecord[]) => void>();
    const div = await renderObservedDiv(callback);
    const element = div.element;

    await div.unmount();
    element?.setAttribute("data-test", "1");

    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(callback).not.toHaveBeenCalled();
  });
});

describe("useMutationObserver ref and option tracking", () => {
  it("observes a subtree that only attaches after the first render", async () => {
    const callback = vi.fn<(mutations: MutationRecord[]) => void>();
    const captured: CapturedElement = { element: null };
    const TestComponent = ({ show }: { show: boolean }) => {
      const ref = useMutationObserver<HTMLDivElement>(callback);
      return show
        ? createElement("div", {
            ref: (node: HTMLDivElement | null) => {
              captured.element = node;
              ref.current = node;
            },
          })
        : null;
    };
    const { rerender } = await render(createElement(TestComponent, { show: false }));

    await rerender(createElement(TestComponent, { show: true }));
    captured.element?.setAttribute("data-late", "1");

    await vi.waitFor(() => expect(callback).toHaveBeenCalled());
  });

  it("does not re-observe for an options object re-created every render", async () => {
    const observe = vi.fn<(target: Node, options?: MutationObserverInit) => void>();
    const disconnect = vi.fn<() => void>();
    vi.stubGlobal(
      "MutationObserver",
      class {
        disconnect = disconnect;
        observe = observe;
        takeRecords = () => [];
      },
    );

    const TestComponent = () => {
      const ref = useMutationObserver<HTMLDivElement>(() => {}, { attributes: true });
      return createElement("div", { ref });
    };
    const { rerender } = await render(createElement(TestComponent));

    expect(observe).toHaveBeenCalledTimes(1);

    await rerender(createElement(TestComponent));
    await rerender(createElement(TestComponent));

    expect(observe).toHaveBeenCalledTimes(1);

    vi.unstubAllGlobals();
  });

  it("re-observes when an option changes", async () => {
    const observe = vi.fn<(target: Node, options?: MutationObserverInit) => void>();
    vi.stubGlobal(
      "MutationObserver",
      class {
        disconnect = vi.fn<() => void>();
        observe = observe;
        takeRecords = () => [];
      },
    );

    const TestComponent = ({ subtree }: { subtree: boolean }) => {
      const ref = useMutationObserver<HTMLDivElement>(() => {}, { attributes: true, subtree });
      return createElement("div", { ref });
    };
    const { rerender } = await render(createElement(TestComponent, { subtree: false }));

    expect(observe).toHaveBeenCalledTimes(1);

    await rerender(createElement(TestComponent, { subtree: true }));

    expect(observe).toHaveBeenCalledTimes(2);

    vi.unstubAllGlobals();
  });
});
