import { renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useViewTransition } from "./use-view-transition.ts";

afterEach(() => {
  // Removes the own-property override installed by each test below, exposing
  // the native (or absent) Document.prototype.startViewTransition again —
  // avoids ever reading the property into a variable just to restore it,
  // which is what triggered `unbound-method` on the old save/restore pattern.
  Reflect.deleteProperty(document, "startViewTransition");
});

describe("useViewTransition", () => {
  it("reports supported: true when startViewTransition exists", () => {
    Object.defineProperty(document, "startViewTransition", {
      configurable: true,
      value: vi.fn<(update: () => Promise<void> | void) => { finished: Promise<void> }>(),
    });

    const { result } = renderHook(() => useViewTransition());

    expect(result.current.supported).toBe(true);
  });

  it("reports supported: false when startViewTransition is unavailable", () => {
    Reflect.deleteProperty(document, "startViewTransition");

    const { result } = renderHook(() => useViewTransition());

    expect(result.current.supported).toBe(false);
  });

  it("startTransition() runs the callback through startViewTransition when supported", async () => {
    const callback = vi.fn<() => Promise<void> | void>();
    const startViewTransition = vi.fn<
      (update: () => Promise<void> | void) => { finished: Promise<void> }
    >((update: () => Promise<void> | void) => {
      const finished = (async () => {
        await Promise.resolve();
        return update();
      })();
      return { finished };
    });
    Object.defineProperty(document, "startViewTransition", {
      configurable: true,
      value: startViewTransition,
    });

    const { result } = renderHook(() => useViewTransition());
    await result.current.startTransition(callback);

    expect(startViewTransition).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it("startTransition() just calls the callback directly when unsupported", async () => {
    Reflect.deleteProperty(document, "startViewTransition");
    const callback = vi.fn<() => Promise<void> | void>();

    const { result } = renderHook(() => useViewTransition());
    await result.current.startTransition(callback);

    expect(callback).toHaveBeenCalledTimes(1);
  });
});
