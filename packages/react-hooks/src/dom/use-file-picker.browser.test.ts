import { renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useFilePicker } from "./use-file-picker.ts";

// SAFETY: single explicit escape hatch for casting test doubles / deliberately
// non-conforming fixtures to a type they don't structurally satisfy, instead of
// scattering `as unknown as X` chains through the test body.
const asTestDouble = <T>(value: unknown): T => value as T;

const DISK_ERROR_MESSAGE = "disk error";

const abortError = (): Error => {
  const error = new Error("The user aborted a request.");
  error.name = "AbortError";
  return error;
};

const stubUnsupported = () => {
  vi.stubGlobal("showOpenFilePicker", undefined);
  vi.stubGlobal("showSaveFilePicker", undefined);
  vi.stubGlobal("showDirectoryPicker", undefined);
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("useFilePicker", () => {
  it("reports supported: false when the File System Access API is unavailable", () => {
    stubUnsupported();

    const { result } = renderHook(() => useFilePicker());

    expect(result.current.supported).toBe(false);
  });

  it("reports supported: true when showOpenFilePicker exists", () => {
    vi.stubGlobal("showOpenFilePicker", vi.fn());

    const { result } = renderHook(() => useFilePicker());

    expect(result.current.supported).toBe(true);
  });

  it("showOpenFilePicker() resolves the picker's handles", async () => {
    // SAFETY: the hook's showOpenFilePicker() only calls the stubbed picker and
    // returns its resolved value untouched (checked below via toBe(handles)),
    // so the minimal shape here never needs to satisfy the full handle interface.
    const handles = asTestDouble<FileSystemFileHandle[]>([{ kind: "file", name: "a.txt" }]);
    vi.stubGlobal(
      "showOpenFilePicker",
      vi.fn(() => Promise.resolve(handles)),
    );

    const { result } = renderHook(() => useFilePicker());
    await expect(result.current.showOpenFilePicker()).resolves.toBe(handles);
  });

  it("showOpenFilePicker() resolves undefined when the user cancels", async () => {
    vi.stubGlobal(
      "showOpenFilePicker",
      vi.fn(() => Promise.reject(abortError())),
    );

    const { result } = renderHook(() => useFilePicker());
    await expect(result.current.showOpenFilePicker()).resolves.toBeUndefined();
  });

  it("showOpenFilePicker() rethrows non-abort errors", async () => {
    vi.stubGlobal(
      "showOpenFilePicker",
      vi.fn(() => Promise.reject(new Error(DISK_ERROR_MESSAGE))),
    );

    const { result } = renderHook(() => useFilePicker());
    await expect(result.current.showOpenFilePicker()).rejects.toThrow(DISK_ERROR_MESSAGE);
  });

  it("showOpenFilePicker() resolves undefined when unsupported", async () => {
    stubUnsupported();

    const { result } = renderHook(() => useFilePicker());
    await expect(result.current.showOpenFilePicker()).resolves.toBeUndefined();
  });

  it("showSaveFilePicker() resolves the picker's handle", async () => {
    // SAFETY: the hook's showSaveFilePicker() only calls the stubbed picker and
    // returns its resolved value untouched (checked below via toBe(handle)),
    // so the minimal shape here never needs to satisfy the full handle interface.
    const handle = asTestDouble<FileSystemFileHandle>({ kind: "file", name: "a.txt" });
    vi.stubGlobal(
      "showSaveFilePicker",
      vi.fn(() => Promise.resolve(handle)),
    );

    const { result } = renderHook(() => useFilePicker());
    await expect(result.current.showSaveFilePicker()).resolves.toBe(handle);
  });

  it("showSaveFilePicker() resolves undefined when the user cancels", async () => {
    vi.stubGlobal(
      "showSaveFilePicker",
      vi.fn(() => Promise.reject(abortError())),
    );

    const { result } = renderHook(() => useFilePicker());
    await expect(result.current.showSaveFilePicker()).resolves.toBeUndefined();
  });

  it("showSaveFilePicker() rethrows non-abort errors", async () => {
    vi.stubGlobal(
      "showSaveFilePicker",
      vi.fn(() => Promise.reject(new Error(DISK_ERROR_MESSAGE))),
    );

    const { result } = renderHook(() => useFilePicker());
    await expect(result.current.showSaveFilePicker()).rejects.toThrow(DISK_ERROR_MESSAGE);
  });

  it("showSaveFilePicker() resolves undefined when unsupported", async () => {
    stubUnsupported();

    const { result } = renderHook(() => useFilePicker());
    await expect(result.current.showSaveFilePicker()).resolves.toBeUndefined();
  });

  it("showDirectoryPicker() resolves the picker's handle", async () => {
    // SAFETY: the hook's showDirectoryPicker() only calls the stubbed picker and
    // returns its resolved value untouched (checked below via toBe(handle)),
    // so the minimal shape here never needs to satisfy the full handle interface.
    const handle = asTestDouble<FileSystemDirectoryHandle>({ kind: "directory", name: "dir" });
    vi.stubGlobal(
      "showDirectoryPicker",
      vi.fn(() => Promise.resolve(handle)),
    );

    const { result } = renderHook(() => useFilePicker());
    await expect(result.current.showDirectoryPicker()).resolves.toBe(handle);
  });

  it("showDirectoryPicker() resolves undefined when the user cancels", async () => {
    vi.stubGlobal(
      "showDirectoryPicker",
      vi.fn(() => Promise.reject(abortError())),
    );

    const { result } = renderHook(() => useFilePicker());
    await expect(result.current.showDirectoryPicker()).resolves.toBeUndefined();
  });

  it("showDirectoryPicker() rethrows non-abort errors", async () => {
    vi.stubGlobal(
      "showDirectoryPicker",
      vi.fn(() => Promise.reject(new Error(DISK_ERROR_MESSAGE))),
    );

    const { result } = renderHook(() => useFilePicker());
    await expect(result.current.showDirectoryPicker()).rejects.toThrow(DISK_ERROR_MESSAGE);
  });

  it("showDirectoryPicker() resolves undefined when unsupported", async () => {
    stubUnsupported();

    const { result } = renderHook(() => useFilePicker());
    await expect(result.current.showDirectoryPicker()).resolves.toBeUndefined();
  });
});
