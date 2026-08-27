import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { usePageLeave } from "./use-page-leave.ts";

const dispatchMouseOut = (relatedTarget: EventTarget | null) => {
  const event = new MouseEvent("mouseout", { relatedTarget });
  document.dispatchEvent(event);
};

describe("usePageLeave", () => {
  it("calls the handler when the pointer leaves the viewport", async () => {
    const onPageLeave = vi.fn();
    renderHook(() => usePageLeave(onPageLeave));

    await act(async () => {
      dispatchMouseOut(null);
    });

    expect(onPageLeave).toHaveBeenCalledTimes(1);
  });

  it("does not call the handler when moving between elements inside the page", async () => {
    const onPageLeave = vi.fn();
    renderHook(() => usePageLeave(onPageLeave));

    await act(async () => {
      dispatchMouseOut(document.body);
    });

    expect(onPageLeave).not.toHaveBeenCalled();
  });

  it("always calls the latest handler without re-subscribing", async () => {
    const firstHandler = vi.fn();
    const secondHandler = vi.fn();
    const { rerender } = renderHook(({ handler }) => usePageLeave(handler), {
      initialProps: { handler: firstHandler },
    });

    rerender({ handler: secondHandler });

    await act(async () => {
      dispatchMouseOut(null);
    });

    expect(firstHandler).not.toHaveBeenCalled();
    expect(secondHandler).toHaveBeenCalledTimes(1);
  });
});
