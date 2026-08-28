import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useAsync } from "./use-async.ts";

describe("useAsync", () => {
  it("starts loading: true with no data/error", () => {
    const { result } = renderHook(() => useAsync(() => Promise.resolve(1)));

    expect(result.current.loading).toBe(true);
    expect(result.current.data).toBeUndefined();
    expect(result.current.error).toBeUndefined();
  });

  it("resolves data and sets loading: false", async () => {
    const { result } = renderHook(() => useAsync(() => Promise.resolve(42)));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.data).toBe(42);
    expect(result.current.error).toBeUndefined();
  });

  it("sets error and loading: false when the promise rejects", async () => {
    const { result } = renderHook(() => useAsync(() => Promise.reject(new Error("boom"))));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error?.message).toBe("boom");
    expect(result.current.data).toBeUndefined();
  });

  it("wraps a non-Error rejection", async () => {
    const { result } = renderHook(() => useAsync(() => Promise.reject("boom")));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error?.message).toBe("boom");
  });

  it("re-runs when a dependency changes", async () => {
    const asyncFn = vi.fn<(value: number) => Promise<number>>((value: number) =>
      Promise.resolve(value * 2),
    );
    const { result, rerender } = renderHook(
      ({ value }) => useAsync(() => asyncFn(value), [value]),
      { initialProps: { value: 1 } },
    );

    await waitFor(() => expect(result.current.data).toBe(2));

    rerender({ value: 5 });
    await waitFor(() => expect(result.current.data).toBe(10));

    expect(asyncFn).toHaveBeenCalledTimes(2);
  });

  it("resets to loading: true when re-running", async () => {
    let resolveSecond: (value: number) => void = (_value: number) => undefined;
    const asyncFn = vi.fn<(value: number) => Promise<number>>((value: number) => {
      if (value === 2) {
        return new Promise<number>((resolve) => {
          resolveSecond = resolve;
        });
      }
      return Promise.resolve(value);
    });
    const { result, rerender } = renderHook(
      ({ value }) => useAsync(() => asyncFn(value), [value]),
      { initialProps: { value: 1 } },
    );

    await waitFor(() => expect(result.current.loading).toBe(false));

    rerender({ value: 2 });
    expect(result.current.loading).toBe(true);

    await act(async () => {
      resolveSecond(2);
      await Promise.resolve();
    });

    expect(result.current.data).toBe(2);
  });

  it("ignores a resolution from a stale run after deps change", async () => {
    let resolveFirst: (value: string) => void = (_value: string) => undefined;
    const first = new Promise<string>((resolve) => {
      resolveFirst = resolve;
    });
    const { result, rerender } = renderHook(
      ({ value }) => useAsync(() => (value === 1 ? first : Promise.resolve("second")), [value]),
      { initialProps: { value: 1 } },
    );

    rerender({ value: 2 });
    await waitFor(() => expect(result.current.data).toBe("second"));

    await act(async () => {
      resolveFirst("first");
      await Promise.resolve();
    });

    expect(result.current.data).toBe("second");
  });

  it("ignores a resolution that arrives after unmount", async () => {
    let resolve: (value: number) => void = (_value: number) => undefined;
    const pending = new Promise<number>((res) => {
      resolve = res;
    });
    const { result, unmount } = renderHook(() => useAsync(() => pending));

    unmount();

    await act(async () => {
      resolve(1);
      await pending;
    });

    expect(result.current.loading).toBe(true);
  });

  it("ignores a rejection that arrives after unmount", async () => {
    let reject: (reason: Error) => void = (_reason: Error) => undefined;
    const pending = new Promise<number>((_res, rej) => {
      reject = rej;
    });
    const { result, unmount } = renderHook(() => useAsync(() => pending));

    unmount();

    await act(async () => {
      reject(new Error("boom"));
      await pending.catch(() => undefined);
    });

    expect(result.current.loading).toBe(true);
  });
});
