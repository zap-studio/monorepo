import { renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useWhyDidYouUpdate } from "./use-why-did-you-update.ts";

afterEach(() => {
  vi.restoreAllMocks();
});

describe(useWhyDidYouUpdate, () => {
  it("does not log on the mount render", () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});

    renderHook(({ props }: { props: Record<string, unknown> }) => useWhyDidYouUpdate("X", props), {
      initialProps: { props: { value: 1 } },
    });

    expect(spy).not.toHaveBeenCalled();
  });

  it("logs the changed keys when props change", () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});

    const { rerender } = renderHook(
      ({ props }: { props: Record<string, unknown> }) => useWhyDidYouUpdate("X", props),
      { initialProps: { props: { value: 1 } } },
    );

    rerender({ props: { value: 2 } });

    expect(spy).toHaveBeenCalledWith("[why-did-you-update] X", { value: { from: 1, to: 2 } });
  });

  it("detects added and removed keys as changes", () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});

    const { rerender } = renderHook(
      ({ props }: { props: Record<string, unknown> }) => useWhyDidYouUpdate("X", props),
      { initialProps: { props: { a: 1 } as Record<string, unknown> } },
    );

    rerender({ props: { b: 2 } });

    expect(spy).toHaveBeenCalledWith("[why-did-you-update] X", {
      a: { from: 1, to: undefined },
      b: { from: undefined, to: 2 },
    });
  });

  it("does not log when no key changed", () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});

    const { rerender } = renderHook(
      ({ props }: { props: Record<string, unknown> }) => useWhyDidYouUpdate("X", props),
      { initialProps: { props: { value: 1 } } },
    );

    rerender({ props: { value: 1 } });

    expect(spy).not.toHaveBeenCalled();
  });
});
