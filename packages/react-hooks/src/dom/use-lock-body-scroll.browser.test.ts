import { renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { useLockBodyScroll } from "./use-lock-body-scroll.ts";

afterEach(() => {
  document.body.style.overflow = "";
});

describe(useLockBodyScroll, () => {
  it("sets body overflow to hidden by default", () => {
    renderHook(() => useLockBodyScroll());

    expect(document.body.style.overflow).toBe("hidden");
  });

  it("does nothing when locked is false", () => {
    renderHook(() => useLockBodyScroll(false));

    expect(document.body.style.overflow).toBe("");
  });

  it("restores the previous overflow value on unlock", () => {
    document.body.style.overflow = "scroll";

    const { rerender } = renderHook(
      ({ locked }: { locked: boolean }) => useLockBodyScroll(locked),
      {
        initialProps: { locked: true },
      },
    );
    expect(document.body.style.overflow).toBe("hidden");

    rerender({ locked: false });

    expect(document.body.style.overflow).toBe("scroll");
  });

  it("restores the previous overflow value on unmount", () => {
    document.body.style.overflow = "auto";

    const { unmount } = renderHook(() => useLockBodyScroll());
    expect(document.body.style.overflow).toBe("hidden");

    unmount();

    expect(document.body.style.overflow).toBe("auto");
  });
});
