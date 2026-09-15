import { afterEach, describe, expect, it } from "vitest";

import { renderHook } from "../../tests/_react.ts";
import { useLockBodyScroll } from "./use-lock-body-scroll.ts";

afterEach(() => {
  document.body.style.overflow = "";
});

describe("useLockBodyScroll", () => {
  it("sets body overflow to hidden by default", async () => {
    await renderHook(() => useLockBodyScroll());

    expect(document.body.style.overflow).toBe("hidden");
  });

  it("does nothing when locked is false", async () => {
    await renderHook(() => useLockBodyScroll(false));

    expect(document.body.style.overflow).toBe("");
  });

  it("restores the previous overflow value on unlock", async () => {
    document.body.style.overflow = "scroll";

    const { rerender } = await renderHook(
      ({ locked }: { locked: boolean }) => useLockBodyScroll(locked),
      {
        initialProps: { locked: true },
      },
    );
    expect(document.body.style.overflow).toBe("hidden");

    await rerender({ locked: false });

    expect(document.body.style.overflow).toBe("scroll");
  });

  it("restores the previous overflow value on unmount", async () => {
    document.body.style.overflow = "auto";

    const { unmount } = await renderHook(() => useLockBodyScroll());
    expect(document.body.style.overflow).toBe("hidden");

    await unmount();

    expect(document.body.style.overflow).toBe("auto");
  });
});
