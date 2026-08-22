import { renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useEyeDropper } from "./use-eye-dropper.ts";

function abortError(): Error {
  const error = new Error("The user chose not to pick a color.");
  error.name = "AbortError";
  return error;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe(useEyeDropper, () => {
  it("reports supported: false when the EyeDropper API is unavailable", () => {
    vi.stubGlobal("EyeDropper", undefined);

    const { result } = renderHook(() => useEyeDropper());

    expect(result.current.supported).toBe(false);
  });

  it("reports supported: true when window.EyeDropper exists", () => {
    vi.stubGlobal(
      "EyeDropper",
      class {
        open() {
          return Promise.resolve({ sRGBHex: "#000000" });
        }
      },
    );

    const { result } = renderHook(() => useEyeDropper());

    expect(result.current.supported).toBe(true);
  });

  it("open() resolves the picked color's sRGBHex", async () => {
    vi.stubGlobal(
      "EyeDropper",
      class {
        open() {
          return Promise.resolve({ sRGBHex: "#ff0000" });
        }
      },
    );

    const { result } = renderHook(() => useEyeDropper());
    await expect(result.current.open()).resolves.toBe("#ff0000");
  });

  it("open() resolves undefined when the user cancels", async () => {
    vi.stubGlobal(
      "EyeDropper",
      class {
        open() {
          return Promise.reject(abortError());
        }
      },
    );

    const { result } = renderHook(() => useEyeDropper());
    await expect(result.current.open()).resolves.toBeUndefined();
  });

  it("open() rethrows non-abort errors", async () => {
    vi.stubGlobal(
      "EyeDropper",
      class {
        open() {
          return Promise.reject(new Error("permission error"));
        }
      },
    );

    const { result } = renderHook(() => useEyeDropper());
    await expect(result.current.open()).rejects.toThrow("permission error");
  });

  it("open() resolves undefined when unsupported", async () => {
    vi.stubGlobal("EyeDropper", undefined);

    const { result } = renderHook(() => useEyeDropper());
    await expect(result.current.open()).resolves.toBeUndefined();
  });
});
