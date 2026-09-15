import { createElement } from "react";
import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import { act, renderHook } from "../../tests/_react.ts";
import { useHover, type UseHoverResult } from "./use-hover.ts";

const renderHoverDiv = async () => {
  let latest!: UseHoverResult<HTMLDivElement>;
  const TestComponent = () => {
    latest = useHover<HTMLDivElement>();
    return createElement("div", { ref: latest.ref });
  };
  const { unmount } = await render(createElement(TestComponent));
  return {
    get current() {
      return latest;
    },
    unmount,
  };
};

describe("useHover", () => {
  it("starts not hovered", async () => {
    const hover = await renderHoverDiv();

    expect(hover.current.hovered).toBe(false);
  });

  it("becomes true on mouseenter", async () => {
    const hover = await renderHoverDiv();

    await act(() => {
      hover.current.ref.current?.dispatchEvent(new Event("mouseenter"));
    });

    expect(hover.current.hovered).toBe(true);
  });

  it("becomes false again on mouseleave", async () => {
    const hover = await renderHoverDiv();

    await act(() => {
      hover.current.ref.current?.dispatchEvent(new Event("mouseenter"));
    });
    expect(hover.current.hovered).toBe(true);

    await act(() => {
      hover.current.ref.current?.dispatchEvent(new Event("mouseleave"));
    });

    expect(hover.current.hovered).toBe(false);
  });

  it("does not attach listeners when no element is attached to the ref", () => {
    expect(async () => {
      await renderHook(() => useHover());
    }).not.toThrow();
  });

  it("removes listeners on unmount", async () => {
    const hover = await renderHoverDiv();
    const element = hover.current.ref.current;

    await hover.unmount();

    await act(() => {
      element?.dispatchEvent(new Event("mouseenter"));
    });

    expect(hover.current.hovered).toBe(false);
  });
});

describe("useHover ref tracking", () => {
  it("tracks an element that only attaches after the first render", async () => {
    let latest!: UseHoverResult<HTMLDivElement>;
    const TestComponent = ({ show }: { show: boolean }) => {
      latest = useHover<HTMLDivElement>();
      return show ? createElement("div", { ref: latest.ref }) : null;
    };
    const { rerender } = await render(createElement(TestComponent, { show: false }));

    await rerender(createElement(TestComponent, { show: true }));
    const element = latest.ref.current;
    await act(() => {
      element?.dispatchEvent(new Event("mouseenter"));
    });

    expect(latest.hovered).toBe(true);
  });

  it("moves the listeners when the ref points at a different element", async () => {
    let latest!: UseHoverResult<HTMLDivElement>;
    const TestComponent = ({ which }: { which: string }) => {
      latest = useHover<HTMLDivElement>();
      return createElement("div", { key: which, ref: latest.ref });
    };
    const { rerender } = await render(createElement(TestComponent, { which: "a" }));
    const first = latest.ref.current;

    await rerender(createElement(TestComponent, { which: "b" }));
    await act(() => {
      first?.dispatchEvent(new Event("mouseenter"));
    });

    expect(latest.hovered).toBe(false);

    await act(() => {
      latest.ref.current?.dispatchEvent(new Event("mouseenter"));
    });

    expect(latest.hovered).toBe(true);
  });
});
