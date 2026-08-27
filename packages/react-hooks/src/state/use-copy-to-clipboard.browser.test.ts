import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useCopyToClipboard } from "./use-copy-to-clipboard.ts";

const setClipboardSupport = (writeText: ((text: string) => Promise<void>) | undefined) => {
  Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    value: writeText ? { writeText } : undefined,
  });
};

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  setClipboardSupport(undefined);
});

describe(useCopyToClipboard, () => {
  it("starts with copied: false", () => {
    const { result } = renderHook(() => useCopyToClipboard());

    expect(result.current.copied).toBe(false);
  });

  it("copy() writes to the clipboard and becomes copied: true", async () => {
    const writeText = vi.fn(() => Promise.resolve());
    setClipboardSupport(writeText);
    const { result } = renderHook(() => useCopyToClipboard());

    let succeeded = false;
    await act(async () => {
      succeeded = await result.current.copy("hello");
    });

    expect(writeText).toHaveBeenCalledWith("hello");
    expect(succeeded).toBe(true);
    expect(result.current.copied).toBe(true);
  });

  it("resets copied back to false after resetAfterMs", async () => {
    setClipboardSupport(() => Promise.resolve());
    const { result } = renderHook(() => useCopyToClipboard(2000));

    await act(async () => {
      await result.current.copy("hello");
    });
    expect(result.current.copied).toBe(true);

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(result.current.copied).toBe(false);
  });

  it("becomes copied: false and sets an error when the write rejects", async () => {
    setClipboardSupport(() => Promise.reject(new Error("denied")));
    const { result } = renderHook(() => useCopyToClipboard());

    let succeeded = true;
    await act(async () => {
      succeeded = await result.current.copy("hello");
    });

    expect(succeeded).toBe(false);
    expect(result.current.copied).toBe(false);
    expect(result.current.error?.message).toBe("denied");
  });

  it("wraps a non-Error rejection", async () => {
    setClipboardSupport(() => Promise.reject("denied"));
    const { result } = renderHook(() => useCopyToClipboard());

    await act(async () => {
      await result.current.copy("hello");
    });

    expect(result.current.error?.message).toBe("denied");
  });

  it("becomes copied: false and sets an error when unsupported", async () => {
    setClipboardSupport(undefined);
    const { result } = renderHook(() => useCopyToClipboard());

    let succeeded = true;
    await act(async () => {
      succeeded = await result.current.copy("hello");
    });

    expect(succeeded).toBe(false);
    expect(result.current.copied).toBe(false);
    expect(result.current.error).toBeInstanceOf(Error);
  });

  it("clears the reset timer on unmount", async () => {
    setClipboardSupport(() => Promise.resolve());
    const { result, unmount } = renderHook(() => useCopyToClipboard());

    await act(async () => {
      await result.current.copy("hello");
    });

    unmount();

    expect(() => vi.advanceTimersByTime(2000)).not.toThrow();
  });
});
