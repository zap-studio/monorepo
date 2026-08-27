import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { usePointerLock } from "./use-pointer-lock.ts";

const setPointerLockSupport = (supported: boolean) => {
  Object.defineProperty(document, "exitPointerLock", {
    configurable: true,
    value: supported ? vi.fn<() => void>() : undefined,
  });
};

const setPointerLockElement = (element: Element | null) => {
  Object.defineProperty(document, "pointerLockElement", {
    configurable: true,
    value: element,
  });
};

afterEach(() => {
  setPointerLockSupport(true);
  setPointerLockElement(null);
});

describe("usePointerLock", () => {
  it("reports supported: true when the Pointer Lock API exists", () => {
    setPointerLockSupport(true);

    const { result } = renderHook(() => usePointerLock());

    expect(result.current.supported).toBe(true);
    expect(result.current.locked).toBe(false);
  });

  it("reports supported: false when the Pointer Lock API is unavailable", () => {
    setPointerLockSupport(false);

    const { result } = renderHook(() => usePointerLock());

    expect(result.current.supported).toBe(false);
  });

  it("requests a lock on the ref'd element", async () => {
    setPointerLockSupport(true);
    const requestPointerLock = vi.fn<() => Promise<void>>(() => Promise.resolve());
    // SAFETY: usePointerLock's request() only calls element.requestPointerLock() on the ref'd element, so a fake exposing just that member stands in for HTMLDivElement here.
    const element = { requestPointerLock } as unknown as HTMLDivElement;

    const { result } = renderHook(() => usePointerLock<HTMLDivElement>());
    result.current.ref.current = element;

    await act(async () => {
      await result.current.request();
    });

    expect(requestPointerLock).toHaveBeenCalledTimes(1);
  });

  it("does not request a lock when no element is attached to the ref", async () => {
    setPointerLockSupport(true);

    const { result } = renderHook(() => usePointerLock());

    await act(async () => {
      await result.current.request();
    });

    expect(result.current.locked).toBe(false);
  });

  it("becomes locked when pointerlockchange fires with the ref'd element locked", async () => {
    setPointerLockSupport(true);
    // SAFETY: the pointerlockchange handler only compares this element to document.pointerLockElement by reference (===), so a fake exposing just requestPointerLock stands in for HTMLDivElement here.
    const element = {
      requestPointerLock: vi.fn<() => Promise<void>>(),
    } as unknown as HTMLDivElement;

    const { result } = renderHook(() => usePointerLock<HTMLDivElement>());
    result.current.ref.current = element;

    await act(async () => {
      setPointerLockElement(element);
      document.dispatchEvent(new Event("pointerlockchange"));
    });

    expect(result.current.locked).toBe(true);
  });

  it("becomes unlocked when pointerlockchange fires with a different element locked", async () => {
    setPointerLockSupport(true);
    // SAFETY: this is the ref'd element; the handler only compares it to document.pointerLockElement by reference, so a fake exposing just requestPointerLock is enough.
    const element = {
      requestPointerLock: vi.fn<() => Promise<void>>(),
    } as unknown as HTMLDivElement;
    // SAFETY: this fake stands in for the "other" element that steals the lock; the handler only compares it to document.pointerLockElement by reference, and requestPointerLock is never invoked on it in this test.
    const other = { requestPointerLock: vi.fn<() => Promise<void>>() } as unknown as HTMLDivElement;

    const { result } = renderHook(() => usePointerLock<HTMLDivElement>());
    result.current.ref.current = element;

    await act(async () => {
      setPointerLockElement(element);
      document.dispatchEvent(new Event("pointerlockchange"));
    });
    expect(result.current.locked).toBe(true);

    await act(async () => {
      setPointerLockElement(other);
      document.dispatchEvent(new Event("pointerlockchange"));
    });

    expect(result.current.locked).toBe(false);
  });

  it("calls document.exitPointerLock() on exit()", () => {
    setPointerLockSupport(true);

    const { result } = renderHook(() => usePointerLock());

    act(() => {
      result.current.exit();
    });

    expect(document.exitPointerLock).toHaveBeenCalledTimes(1);
  });

  it("no-ops request()/exit() when unsupported", async () => {
    setPointerLockSupport(false);

    const { result } = renderHook(() => usePointerLock());

    await act(async () => {
      await result.current.request();
      result.current.exit();
    });

    expect(result.current.locked).toBe(false);
  });

  it("removes the pointerlockchange listener on unmount", async () => {
    setPointerLockSupport(true);
    // SAFETY: after unmount the pointerlockchange listener is removed, so this element only needs to satisfy the ref assignment; requestPointerLock and reference equality with document.pointerLockElement are the only members the hook would have touched.
    const element = {
      requestPointerLock: vi.fn<() => Promise<void>>(),
    } as unknown as HTMLDivElement;

    const { result, unmount } = renderHook(() => usePointerLock<HTMLDivElement>());
    result.current.ref.current = element;
    unmount();

    await act(async () => {
      setPointerLockElement(element);
      document.dispatchEvent(new Event("pointerlockchange"));
    });

    expect(result.current.locked).toBe(false);
  });
});

describe("usePointerLock with an unattached ref", () => {
  it("stays false when another element releases the pointer lock", () => {
    setPointerLockSupport(true);
    setPointerLockElement(null);

    const { result } = renderHook(() => usePointerLock());

    act(() => {
      document.dispatchEvent(new Event("pointerlockchange"));
    });

    expect(result.current.locked).toBe(false);
  });
});
