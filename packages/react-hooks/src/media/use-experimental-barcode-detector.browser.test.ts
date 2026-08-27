import { renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useExperimentalBarcodeDetector } from "./use-experimental-barcode-detector.ts";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("useExperimentalBarcodeDetector", () => {
  it("reports supported: false when the Barcode Detection API is unavailable", () => {
    vi.stubGlobal("BarcodeDetector", undefined);

    const { result } = renderHook(() => useExperimentalBarcodeDetector());

    expect(result.current.supported).toBe(false);
  });

  it("reports supported: true when window.BarcodeDetector exists", () => {
    vi.stubGlobal(
      "BarcodeDetector",
      class {
        detect() {
          return Promise.resolve([]);
        }
        static getSupportedFormats() {
          return Promise.resolve(["qr_code"]);
        }
      },
    );

    const { result } = renderHook(() => useExperimentalBarcodeDetector());

    expect(result.current.supported).toBe(true);
  });

  it("detect() constructs a detector scoped to the given formats and returns its result", async () => {
    const detect = vi.fn().mockResolvedValue([{ format: "qr_code", rawValue: "hello" }]);
    const BarcodeDetectorCtor = vi.fn().mockImplementation(function BarcodeDetector() {
      return { detect };
    });
    vi.stubGlobal("BarcodeDetector", BarcodeDetectorCtor);

    const { result } = renderHook(() => useExperimentalBarcodeDetector(["qr_code"]));
    const image = {} as HTMLImageElement;

    await expect(result.current.detect(image)).resolves.toEqual([
      { format: "qr_code", rawValue: "hello" },
    ]);
    expect(BarcodeDetectorCtor).toHaveBeenCalledWith({ formats: ["qr_code"] });
    expect(detect).toHaveBeenCalledWith(image);
  });

  it("detect() constructs a detector for every format when none are given", async () => {
    const detect = vi.fn().mockResolvedValue([]);
    const BarcodeDetectorCtor = vi.fn().mockImplementation(function BarcodeDetector() {
      return { detect };
    });
    vi.stubGlobal("BarcodeDetector", BarcodeDetectorCtor);

    const { result } = renderHook(() => useExperimentalBarcodeDetector());
    const image = {} as HTMLImageElement;

    await result.current.detect(image);

    expect(BarcodeDetectorCtor).toHaveBeenCalledWith(undefined);
  });

  it("detect() resolves undefined when unsupported", async () => {
    vi.stubGlobal("BarcodeDetector", undefined);

    const { result } = renderHook(() => useExperimentalBarcodeDetector());

    await expect(result.current.detect({} as HTMLImageElement)).resolves.toBeUndefined();
  });

  it("getSupportedFormats() delegates to the static method", async () => {
    const getSupportedFormats = vi.fn().mockResolvedValue(["qr_code", "ean_13"]);
    vi.stubGlobal("BarcodeDetector", { getSupportedFormats });

    const { result } = renderHook(() => useExperimentalBarcodeDetector());

    await expect(result.current.getSupportedFormats()).resolves.toEqual(["qr_code", "ean_13"]);
  });

  it("getSupportedFormats() resolves undefined when unsupported", async () => {
    vi.stubGlobal("BarcodeDetector", undefined);

    const { result } = renderHook(() => useExperimentalBarcodeDetector());

    await expect(result.current.getSupportedFormats()).resolves.toBeUndefined();
  });
});

describe("useExperimentalBarcodeDetector format stability", () => {
  it("keeps detect stable across renders with an inline formats array", () => {
    const { rerender, result } = renderHook(() => useExperimentalBarcodeDetector(["qr_code"]));
    const first = result.current.detect;

    rerender();

    expect(result.current.detect).toBe(first);
  });
});
