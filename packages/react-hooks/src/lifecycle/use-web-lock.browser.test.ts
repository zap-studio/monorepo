import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { asTestDouble } from "../../tests/_test-double.ts";
import { useWebLock } from "./use-web-lock.ts";

const setLocksSupport = (
  request:
    | ((
        name: string,
        options: LockOptions,
        callback: (lock: Lock | null) => unknown,
      ) => Promise<unknown>)
    | undefined,
) => {
  Object.defineProperty(navigator, "locks", {
    configurable: true,
    value: request ? { request } : undefined,
  });
};

afterEach(() => {
  setLocksSupport(undefined);
});

describe("useWebLock", () => {
  it("reports supported: true when navigator.locks exists", () => {
    setLocksSupport(() => Promise.resolve(undefined));

    const { result } = renderHook(() => useWebLock("my-lock"));

    expect(result.current.supported).toBe(true);
    expect(result.current.status).toBe("idle");
  });

  it("reports supported: false when navigator.locks is unavailable", () => {
    setLocksSupport(undefined);

    const { result } = renderHook(() => useWebLock("my-lock"));

    expect(result.current.supported).toBe(false);
  });

  it('runExclusive() requests the named lock, holds it, and becomes "released"', async () => {
    const request = vi.fn<
      (
        name: string,
        options: LockOptions,
        callback: (lock: Lock | null) => unknown,
      ) => Promise<unknown>
    >(async (name: string, options: LockOptions, callback: (lock: Lock | null) => unknown) =>
      callback(asTestDouble<Lock>({ mode: options.mode ?? "exclusive", name })),
    );
    setLocksSupport(request);
    const { result } = renderHook(() => useWebLock("my-lock"));

    let value = 0;
    await act(async () => {
      value = (await result.current.runExclusive(() => 42)) ?? 0;
    });

    expect(request).toHaveBeenCalledWith("my-lock", expect.any(Object), expect.any(Function));
    expect(value).toBe(42);
    expect(result.current.status).toBe("released");
  });

  it('becomes "error" and resolves undefined when the callback throws', async () => {
    setLocksSupport(async (_name, _options, callback) => callback(null));
    const { result } = renderHook(() => useWebLock("my-lock"));

    let value: number | undefined = 1;
    await act(async () => {
      value = await result.current.runExclusive(() => {
        throw new Error("boom");
      });
    });

    expect(value).toBeUndefined();
    expect(result.current.status).toBe("error");
    expect(result.current.error?.message).toBe("boom");
  });

  it("wraps a non-Error rejection", async () => {
    setLocksSupport(() => Promise.reject("boom"));
    const { result } = renderHook(() => useWebLock("my-lock"));

    await act(async () => {
      await result.current.runExclusive(() => 1);
    });

    expect(result.current.error?.message).toBe("boom");
  });

  it('runExclusive() resolves undefined and becomes "error" when unsupported', async () => {
    setLocksSupport(undefined);
    const { result } = renderHook(() => useWebLock("my-lock"));

    let value: number | undefined = 1;
    await act(async () => {
      value = await result.current.runExclusive(() => 1);
    });

    expect(value).toBeUndefined();
    expect(result.current.status).toBe("error");
  });
});

describe("useWebLock option stability", () => {
  it("keeps runExclusive stable across renders with an inline options object", () => {
    const { rerender, result } = renderHook(() => useWebLock("cart", { mode: "shared" }));
    const first = result.current.runExclusive;

    rerender();

    expect(result.current.runExclusive).toBe(first);
  });
});
