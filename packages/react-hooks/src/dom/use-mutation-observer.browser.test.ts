import { render, renderHook, waitFor } from "@testing-library/react";
import { createElement } from "react";
import { describe, expect, it, vi } from "vitest";

import { useMutationObserver } from "./use-mutation-observer.ts";

function renderObservedDiv(callback: (mutations: MutationRecord[]) => void) {
  let element: HTMLDivElement | null = null;
  function TestComponent() {
    const ref = useMutationObserver<HTMLDivElement>(callback);
    return createElement("div", {
      ref: (node: HTMLDivElement | null) => {
        element = node;
        ref.current = node;
      },
    });
  }
  const { unmount } = render(createElement(TestComponent));
  return {
    get element() {
      return element;
    },
    unmount,
  };
}

describe(useMutationObserver, () => {
  it("calls the callback when an attribute changes on the ref'd element", async () => {
    const callback = vi.fn();
    const div = renderObservedDiv(callback);

    div.element?.setAttribute("data-test", "1");

    await waitFor(() => expect(callback).toHaveBeenCalled());
    const mutations = callback.mock.calls[0]?.[0] as MutationRecord[];
    expect(mutations[0]?.attributeName).toBe("data-test");
  });

  it("calls the latest callback without re-subscribing", async () => {
    const first = vi.fn();
    const second = vi.fn();
    const box: { current: HTMLDivElement | null } = { current: null };
    function TestComponent({ callback }: { callback: (mutations: MutationRecord[]) => void }) {
      const ref = useMutationObserver<HTMLDivElement>(callback);
      return createElement("div", {
        ref: (node: HTMLDivElement | null) => {
          box.current = node;
          ref.current = node;
        },
      });
    }
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
    const callback = vi.fn();
    const div = renderObservedDiv(callback);
    const element = div.element;

    div.unmount();
    element?.setAttribute("data-test", "1");

    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(callback).not.toHaveBeenCalled();
  });
});
