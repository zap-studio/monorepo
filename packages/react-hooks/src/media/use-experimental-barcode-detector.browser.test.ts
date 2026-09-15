import { afterEach, describe, expect, it, vi } from "vitest";

import { renderHook } from "../../tests/_react.ts";
import { asTestDouble } from "../../tests/_test-double.ts";
import { useExperimentalBarcodeDetector } from "./use-experimental-barcode-detector.ts";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("useExperimentalBarcodeDetector", () => {
  it("reports supported: false when the Barcode Detection API is unavailable", async () => {
    vi.stubGlobal("BarcodeDetector", undefined);

    const { result } = await renderHook(() => useExperimentalBarcodeDetector());

    expect(result.current.supported).toBe(false);
  });

  it("reports supported: true when window.BarcodeDetector exists", async () => {
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

    const { result } = await renderHook(() => useExperimentalBarcodeDetector());

    expect(result.current.supported).toBe(true);
  });

  it("detect() constructs a detector scoped to the given formats and returns its result", async () => {
    const detect = vi
      .fn<() => Promise<{ format: string; rawValue: string }[]>>()
      .mockResolvedValue([{ format: "qr_code", rawValue: "hello" }]);
    const BarcodeDetectorCtor = vi
      .fn<new (options?: { formats?: string[] }) => { detect: typeof detect }>()
      .mockImplementation(function BarcodeDetector() {
        return { detect };
      });
    vi.stubGlobal("BarcodeDetector", BarcodeDetectorCtor);

    const { result } = await renderHook(() => useExperimentalBarcodeDetector(["qr_code"]));
    const image = asTestDouble<HTMLImageElement>({});

    await expect(result.current.detect(image)).resolves.toEqual([
      { format: "qr_code", rawValue: "hello" },
    ]);
    expect(BarcodeDetectorCtor).toHaveBeenCalledWith({ formats: ["qr_code"] });
    expect(detect).toHaveBeenCalledWith(image);
  });

  it("detect() constructs a detector for every format when none are given", async () => {
    const detect = vi.fn<() => Promise<never[]>>().mockResolvedValue([]);
    const BarcodeDetectorCtor = vi
      .fn<new (options?: { formats?: string[] }) => { detect: typeof detect }>()
      .mockImplementation(function BarcodeDetector() {
        return { detect };
      });
    vi.stubGlobal("BarcodeDetector", BarcodeDetectorCtor);

    const { result } = await renderHook(() => useExperimentalBarcodeDetector());
    const image = asTestDouble<HTMLImageElement>({});

    await result.current.detect(image);

    expect(BarcodeDetectorCtor).toHaveBeenCalledWith(undefined);
  });

  it("detect() resolves undefined when unsupported", async () => {
    vi.stubGlobal("BarcodeDetector", undefined);

    const { result } = await renderHook(() => useExperimentalBarcodeDetector());

    await expect(
      result.current.detect(asTestDouble<HTMLImageElement>({})),
    ).resolves.toBeUndefined();
  });

  it("getSupportedFormats() delegates to the static method", async () => {
    const getSupportedFormats = vi
      .fn<() => Promise<string[]>>()
      .mockResolvedValue(["qr_code", "ean_13"]);
    vi.stubGlobal("BarcodeDetector", { getSupportedFormats });

    const { result } = await renderHook(() => useExperimentalBarcodeDetector());

    await expect(result.current.getSupportedFormats()).resolves.toEqual(["qr_code", "ean_13"]);
  });

  it("getSupportedFormats() resolves undefined when unsupported", async () => {
    vi.stubGlobal("BarcodeDetector", undefined);

    const { result } = await renderHook(() => useExperimentalBarcodeDetector());

    await expect(result.current.getSupportedFormats()).resolves.toBeUndefined();
  });
});

describe("useExperimentalBarcodeDetector format stability", () => {
  it("keeps detect stable across renders with an inline formats array", async () => {
    const { rerender, result } = await renderHook(() =>
      useExperimentalBarcodeDetector(["qr_code"]),
    );
    const first = result.current.detect;

    await rerender();

    expect(result.current.detect).toBe(first);
  });
});
