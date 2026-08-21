import { act, render, renderHook } from "@testing-library/react";
import { createElement } from "react";
import { describe, expect, it } from "vitest";

import { useHover, type UseHoverResult } from "./use-hover.ts";

function renderHoverDiv() {
  let latest!: UseHoverResult<HTMLDivElement>;
  function TestComponent() {
    latest = useHover<HTMLDivElement>();
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
