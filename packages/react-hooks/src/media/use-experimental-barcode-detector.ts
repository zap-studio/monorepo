import { useCallback } from "react";

import {
  getBarcodeDetectorConstructor,
  type BarcodeDetectorSource,
  type BarcodeFormat,
  type DetectedBarcode,
} from "./_barcode-detection-api.ts";

export type {
  BarcodeDetectorSource,
  BarcodeFormat,
  DetectedBarcode,
} from "./_barcode-detection-api.ts";

/** The shape returned by `useExperimentalBarcodeDetector`. */
export interface UseExperimentalBarcodeDetectorResult {
  detect: (image: BarcodeDetectorSource) => Promise<DetectedBarcode[] | undefined>;
  getSupportedFormats: () => Promise<BarcodeFormat[] | undefined>;
  supported: boolean;
}

/**
 * Wraps the Barcode Detection API's `BarcodeDetector` — Experimental per
 * MDN, Chromium-only, no Safari/Firefox support. `detect()` scans an
 * image/video/canvas source for barcodes, resolving `undefined` — rather
 * than throwing — where the API is unsupported. A fresh `BarcodeDetector`
 * is constructed per call, scoped to the `formats` passed to the hook (all
 * supported formats, if omitted).
 *
 * @example
 * ```tsx
 * const { detect, supported } = useExperimentalBarcodeDetector(["qr_code"]);
 * const barcodes = supported ? await detect(videoElement) : undefined;
 * ```
 */
export const useExperimentalBarcodeDetector = (
  formats?: BarcodeFormat[],
): UseExperimentalBarcodeDetectorResult => {
  const supported = Boolean(getBarcodeDetectorConstructor());

  const detect = useCallback(
    async (image: BarcodeDetectorSource): Promise<DetectedBarcode[] | undefined> => {
      const BarcodeDetectorCtor = getBarcodeDetectorConstructor();
      if (!BarcodeDetectorCtor) {
        return undefined;
      }
      const detector = new BarcodeDetectorCtor(formats ? { formats } : undefined);
      return detector.detect(image);
    },
    [formats],
  );

  const getSupportedFormats = useCallback(async (): Promise<BarcodeFormat[] | undefined> => {
    const BarcodeDetectorCtor = getBarcodeDetectorConstructor();
    return BarcodeDetectorCtor ? BarcodeDetectorCtor.getSupportedFormats() : undefined;
  }, []);

  return { detect, getSupportedFormats, supported };
};
