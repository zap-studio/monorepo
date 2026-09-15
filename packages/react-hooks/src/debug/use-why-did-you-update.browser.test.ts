import { afterEach, describe, expect, it, vi } from "vitest";

import { renderHook } from "../../tests/_react.ts";
import { useWhyDidYouUpdate } from "./use-why-did-you-update.ts";

interface TestProps {
  [key: string]: unknown;
  a?: number;
  b?: number;
  value?: number;
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("useWhyDidYouUpdate", () => {
  it("does not log on the mount render", async () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});

    await renderHook(
      ({ props }: { props: Record<string, unknown> }) => useWhyDidYouUpdate("X", props),
      {
        initialProps: { props: { value: 1 } },
      },
    );

    expect(spy).not.toHaveBeenCalled();
  });

  it("logs the changed keys when props change", async () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});

    const { rerender } = await renderHook(
      ({ props }: { props: Record<string, unknown> }) => useWhyDidYouUpdate("X", props),
      { initialProps: { props: { value: 1 } } },
    );

    await rerender({ props: { value: 2 } });

    expect(spy).toHaveBeenCalledWith("[why-did-you-update] X", { value: { from: 1, to: 2 } });
  });

  it("detects added and removed keys as changes", async () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});

    const initialProps: TestProps = { a: 1 };
    const { rerender } = await renderHook(
      ({ props }: { props: TestProps }) => useWhyDidYouUpdate("X", props),
      { initialProps: { props: initialProps } },
    );

    await rerender({ props: { b: 2 } });

    expect(spy).toHaveBeenCalledWith("[why-did-you-update] X", {
      a: { from: 1 },
      b: { to: 2 },
    });
  });

  it("does not log when no key changed", async () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});

    const { rerender } = await renderHook(
      ({ props }: { props: Record<string, unknown> }) => useWhyDidYouUpdate("X", props),
      { initialProps: { props: { value: 1 } } },
    );

    await rerender({ props: { value: 1 } });

    expect(spy).not.toHaveBeenCalled();
  });
});
