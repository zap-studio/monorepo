import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useViewTransition } from "./use-view-transition.ts";

describe("useViewTransition", () => {
  it("reports supported: true when startViewTransition exists", () => {
    const original = document.startViewTransition;
    Object.defineProperty(document, "startViewTransition", {
      configurable: true,
      value: vi.fn(),
    });

    const { result } = renderHook(() => useViewTransition());

    expect(result.current.supported).toBe(true);
    Object.defineProperty(document, "startViewTransition", {
      configurable: true,
      value: original,
    });
  });

  it("reports supported: false when startViewTransition is unavailable", () => {
    const original = document.startViewTransition;
    Object.defineProperty(document, "startViewTransition", {
      configurable: true,
      value: undefined,
    });

    const { result } = renderHook(() => useViewTransition());

    expect(result.current.supported).toBe(false);
    Object.defineProperty(document, "startViewTransition", {
      configurable: true,
      value: original,
    });
  });

  it("startTransition() runs the callback through startViewTransition when supported", async () => {
    const callback = vi.fn();
    const startViewTransition = vi.fn<
      (update: () => Promise<void> | void) => { finished: Promise<void> }
    >((update: () => Promise<void> | void) => {
      const finished = Promise.resolve().then(() => update());
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

    Object.defineProperty(document, "startViewTransition", {
      configurable: true,
      value: undefined,
    });
  });

  it("startTransition() just calls the callback directly when unsupported", async () => {
    const original = document.startViewTransition;
    Object.defineProperty(document, "startViewTransition", {
      configurable: true,
      value: undefined,
    });
    const callback = vi.fn();

    const { result } = renderHook(() => useViewTransition());
    await result.current.startTransition(callback);

    expect(callback).toHaveBeenCalledTimes(1);
    Object.defineProperty(document, "startViewTransition", {
      configurable: true,
      value: original,
    });
  });
});
