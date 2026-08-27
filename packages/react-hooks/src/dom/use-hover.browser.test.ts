import { act, render, renderHook } from "@testing-library/react";
import { createElement } from "react";
import { describe, expect, it } from "vitest";

import { useHover, type UseHoverResult } from "./use-hover.ts";

const renderHoverDiv = () => {
  let latest!: UseHoverResult<HTMLDivElement>;
  const TestComponent = () => {
    latest = useHover<HTMLDivElement>();
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

describe(useHover, () => {
  it("starts not hovered", () => {
    const hover = renderHoverDiv();

    expect(hover.current.hovered).toBe(false);
  });

  it("becomes true on mouseenter", () => {
    const hover = renderHoverDiv();

    act(() => {
      hover.current.ref.current?.dispatchEvent(new Event("mouseenter"));
    });

    expect(hover.current.hovered).toBe(true);
  });

  it("becomes false again on mouseleave", () => {
    const hover = renderHoverDiv();

    act(() => {
      hover.current.ref.current?.dispatchEvent(new Event("mouseenter"));
    });
    expect(hover.current.hovered).toBe(true);

    act(() => {
      hover.current.ref.current?.dispatchEvent(new Event("mouseleave"));
    });

    expect(hover.current.hovered).toBe(false);
  });

  it("does not attach listeners when no element is attached to the ref", () => {
    expect(() => {
      renderHook(() => useHover());
    }).not.toThrow();
  });

  it("removes listeners on unmount", () => {
    const hover = renderHoverDiv();
    const element = hover.current.ref.current;

    hover.unmount();

    act(() => {
      element?.dispatchEvent(new Event("mouseenter"));
    });

    expect(hover.current.hovered).toBe(false);
  });
});

describe("useHover ref tracking", () => {
  it("tracks an element that only attaches after the first render", () => {
    let latest!: UseHoverResult<HTMLDivElement>;
    const TestComponent = ({ show }: { show: boolean }) => {
      latest = useHover<HTMLDivElement>();
      return show ? createElement("div", { ref: latest.ref }) : null;
    };
    const { rerender } = render(createElement(TestComponent, { show: false }));

    rerender(createElement(TestComponent, { show: true }));
    const element = latest.ref.current;
    act(() => {
      element?.dispatchEvent(new Event("mouseenter"));
    });

    expect(latest.hovered).toBe(true);
  });

  it("moves the listeners when the ref points at a different element", () => {
    let latest!: UseHoverResult<HTMLDivElement>;
    const TestComponent = ({ which }: { which: string }) => {
      latest = useHover<HTMLDivElement>();
      return createElement("div", { key: which, ref: latest.ref });
    };
    const { rerender } = render(createElement(TestComponent, { which: "a" }));
    const first = latest.ref.current;

    rerender(createElement(TestComponent, { which: "b" }));
    act(() => {
      first?.dispatchEvent(new Event("mouseenter"));
    });

    expect(latest.hovered).toBe(false);

    act(() => {
      latest.ref.current?.dispatchEvent(new Event("mouseenter"));
    });

    expect(latest.hovered).toBe(true);
  });
});
