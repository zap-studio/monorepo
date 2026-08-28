import { render, renderHook, waitFor } from "@testing-library/react";
import { createElement } from "react";
import { describe, expect, it, vi } from "vitest";

import { useMutationObserver } from "./use-mutation-observer.ts";

interface MutableBox {
  current: HTMLDivElement | null;
}

const renderObservedDiv = (callback: (mutations: MutationRecord[]) => void) => {
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
  const { unmount } = render(createElement(TestComponent));
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
    const div = renderObservedDiv(callback);

    div.element?.setAttribute("data-test", "1");

    await waitFor(() => expect(callback).toHaveBeenCalled());
    // SAFETY: the waitFor above guarantees calls[0] exists, and callback is typed as
    // vi.fn<(mutations: MutationRecord[]) => void>(), so its first argument is always
    // a MutationRecord[].
    const mutations = callback.mock.calls[0]?.[0] as MutationRecord[];
    expect(mutations[0]?.attributeName).toBe("data-test");
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
    const { rerender } = render(createElement(TestComponent, { callback: first }));

    rerender(createElement(TestComponent, { callback: second }));
    box.current?.setAttribute("data-test", "1");

    await waitFor(() => expect(second).toHaveBeenCalled());
    expect(first).not.toHaveBeenCalled();
  });

  it("does not observe when no element is attached to the ref", () => {
    expect(() => {
      renderHook(() => useMutationObserver(() => {}));
    }).not.toThrow();
  });

  it("does not observe when MutationObserver is unsupported", () => {
    vi.stubGlobal("MutationObserver", undefined);

    expect(() => {
      renderObservedDiv(() => {});
    }).not.toThrow();

    vi.unstubAllGlobals();
  });

  it("disconnects the observer on unmount", async () => {
    const callback = vi.fn<(mutations: MutationRecord[]) => void>();
    const div = renderObservedDiv(callback);
    const element = div.element;

    div.unmount();
    element?.setAttribute("data-test", "1");

    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(callback).not.toHaveBeenCalled();
  });
});

describe("useMutationObserver ref and option tracking", () => {
  it("observes a subtree that only attaches after the first render", async () => {
    const callback = vi.fn<(mutations: MutationRecord[]) => void>();
    let element: HTMLDivElement | null = null;
    const TestComponent = ({ show }: { show: boolean }) => {
      const ref = useMutationObserver<HTMLDivElement>(callback);
      return show
        ? createElement("div", {
            ref: (node: HTMLDivElement | null) => {
              element = node;
              ref.current = node;
            },
          })
        : null;
    };
    const { rerender } = render(createElement(TestComponent, { show: false }));

    rerender(createElement(TestComponent, { show: true }));
    // SAFETY: `element` is only ever assigned inside the div's ref callback above, which
    // always receives an HTMLDivElement | null, matching its declared type exactly.
    (element as HTMLDivElement | null)?.setAttribute("data-late", "1");

    await waitFor(() => expect(callback).toHaveBeenCalled());
  });

  it("does not re-observe for an options object re-created every render", () => {
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
    const { rerender } = render(createElement(TestComponent));

    expect(observe).toHaveBeenCalledTimes(1);

    rerender(createElement(TestComponent));
    rerender(createElement(TestComponent));

    expect(observe).toHaveBeenCalledTimes(1);

    vi.unstubAllGlobals();
  });

  it("re-observes when an option changes", () => {
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
    const { rerender } = render(createElement(TestComponent, { subtree: false }));

    expect(observe).toHaveBeenCalledTimes(1);

    rerender(createElement(TestComponent, { subtree: true }));

    expect(observe).toHaveBeenCalledTimes(2);

    vi.unstubAllGlobals();
  });
});
