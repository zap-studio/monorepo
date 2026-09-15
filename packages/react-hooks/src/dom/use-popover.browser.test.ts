import { createElement } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { render } from "vitest-browser-react";

import { act, renderHook } from "../../tests/_react.ts";
import { usePopover, type UsePopoverResult } from "./use-popover.ts";

const renderPopoverDiv = async () => {
  let latest!: UsePopoverResult<HTMLDivElement>;
  const TestComponent = () => {
    latest = usePopover<HTMLDivElement>();
    return createElement("div", { popover: "manual", ref: latest.ref });
  };
  const { unmount } = await render(createElement(TestComponent));
  return {
    get current() {
      return latest;
    },
    unmount,
  };
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("usePopover", () => {
  it("reports supported: true when togglePopover exists", async () => {
    const { result } = await renderHook(() => usePopover());

    expect(result.current.supported).toBe(true);
    expect(result.current.isOpen).toBe(false);
  });

  it("reports supported: false when the Popover API is unavailable", async () => {
    vi.stubGlobal("HTMLElement", class {});

    const { result } = await renderHook(() => usePopover());

    expect(result.current.supported).toBe(false);
  });

  it("show() opens the popover and updates isOpen", async () => {
    const popover = await renderPopoverDiv();

    await act(() => {
      popover.current.show();
    });

    await vi.waitFor(() => expect(popover.current.isOpen).toBe(true));
    expect(popover.current.ref.current?.matches(":popover-open")).toBe(true);
  });

  it("hide() closes the popover and updates isOpen", async () => {
    const popover = await renderPopoverDiv();

    await act(() => {
      popover.current.show();
    });
    await vi.waitFor(() => expect(popover.current.isOpen).toBe(true));

    await act(() => {
      popover.current.hide();
    });

    await vi.waitFor(() => expect(popover.current.isOpen).toBe(false));
  });

  it("toggle() flips the open state", async () => {
    const popover = await renderPopoverDiv();

    await act(() => {
      popover.current.toggle();
    });
    await vi.waitFor(() => expect(popover.current.isOpen).toBe(true));

    await act(() => {
      popover.current.toggle();
    });
    await vi.waitFor(() => expect(popover.current.isOpen).toBe(false));
  });

  it("does not throw when calling show()/hide()/toggle() with no element attached", async () => {
    const { result } = await renderHook(() => usePopover());

    expect(async () => {
      await act(() => {
        result.current.show();
        result.current.hide();
        result.current.toggle();
      });
    }).not.toThrow();
  });

  it("removes the toggle listener on unmount", async () => {
    const popover = await renderPopoverDiv();
    const element = popover.current.ref.current;

    await popover.unmount();

    await act(() => {
      element?.dispatchEvent(new ToggleEvent("toggle", { newState: "open" }));
    });

    expect(popover.current.isOpen).toBe(false);
  });
});

describe("usePopover ref tracking", () => {
  it("tracks a popover that only attaches after the first render", async () => {
    let latest!: UsePopoverResult<HTMLDivElement>;
    const TestComponent = ({ show }: { show: boolean }) => {
      latest = usePopover<HTMLDivElement>();
      return show ? createElement("div", { popover: "manual", ref: latest.ref }) : null;
    };
    const { rerender } = await render(createElement(TestComponent, { show: false }));

    await rerender(createElement(TestComponent, { show: true }));
    await act(() => {
      latest.show();
    });

    await vi.waitFor(() => expect(latest.isOpen).toBe(true));
  });
});
