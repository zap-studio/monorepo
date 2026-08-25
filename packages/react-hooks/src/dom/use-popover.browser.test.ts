import { act, render, renderHook, waitFor } from "@testing-library/react";
import { createElement } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { usePopover, type UsePopoverResult } from "./use-popover.ts";

function renderPopoverDiv() {
  let latest!: UsePopoverResult<HTMLDivElement>;
  function TestComponent() {
    latest = usePopover<HTMLDivElement>();
    return createElement("div", { popover: "manual", ref: latest.ref });
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
  vi.unstubAllGlobals();
});

describe(usePopover, () => {
  it("reports supported: true when togglePopover exists", () => {
    const { result } = renderHook(() => usePopover());

    expect(result.current.supported).toBe(true);
    expect(result.current.isOpen).toBe(false);
  });

  it("reports supported: false when the Popover API is unavailable", () => {
    vi.stubGlobal("HTMLElement", class {});

    const { result } = renderHook(() => usePopover());

    expect(result.current.supported).toBe(false);
  });

  it("show() opens the popover and updates isOpen", async () => {
    const popover = renderPopoverDiv();

    act(() => {
      popover.current.show();
    });

    await waitFor(() => expect(popover.current.isOpen).toBe(true));
    expect(popover.current.ref.current?.matches(":popover-open")).toBe(true);
  });

  it("hide() closes the popover and updates isOpen", async () => {
    const popover = renderPopoverDiv();

    act(() => {
      popover.current.show();
    });
    await waitFor(() => expect(popover.current.isOpen).toBe(true));

    act(() => {
      popover.current.hide();
    });

    await waitFor(() => expect(popover.current.isOpen).toBe(false));
  });

  it("toggle() flips the open state", async () => {
    const popover = renderPopoverDiv();

    act(() => {
      popover.current.toggle();
    });
    await waitFor(() => expect(popover.current.isOpen).toBe(true));

    act(() => {
      popover.current.toggle();
    });
    await waitFor(() => expect(popover.current.isOpen).toBe(false));
  });

  it("does not throw when calling show()/hide()/toggle() with no element attached", () => {
    const { result } = renderHook(() => usePopover());

    expect(() => {
      act(() => {
        result.current.show();
        result.current.hide();
        result.current.toggle();
      });
    }).not.toThrow();
  });

  it("removes the toggle listener on unmount", () => {
    const popover = renderPopoverDiv();
    const element = popover.current.ref.current;

    popover.unmount();

    act(() => {
      element?.dispatchEvent(new ToggleEvent("toggle", { newState: "open" }));
    });

    expect(popover.current.isOpen).toBe(false);
  });
});

describe("usePopover ref tracking", () => {
  it("tracks a popover that only attaches after the first render", async () => {
    let latest!: UsePopoverResult<HTMLDivElement>;
    function TestComponent({ show }: { show: boolean }) {
      latest = usePopover<HTMLDivElement>();
      return show ? createElement("div", { popover: "manual", ref: latest.ref }) : null;
    }
    const { rerender } = render(createElement(TestComponent, { show: false }));

    rerender(createElement(TestComponent, { show: true }));
    act(() => {
      latest.show();
    });

    await waitFor(() => expect(latest.isOpen).toBe(true));
  });
});
