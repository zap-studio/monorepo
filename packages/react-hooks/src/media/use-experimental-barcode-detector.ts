import { useCallback, useEffect, useRef } from "react";

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
 * Wraps the Barcode Detection API's `BarcodeDetector`. MDN marks this as
 * experimental, and it only works in Chromium browsers (not Safari or
 * Firefox). `detect()` scans an image, video, or canvas for barcodes. If
 * the API isn't supported, it returns `undefined` instead of throwing an
 * error. Each call creates a new `BarcodeDetector`, using the `formats`
 * you passed to the hook (or all supported formats if you didn't pass
 * any).
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

  const formatsRef = useRef(formats);
  useEffect(() => {
    formatsRef.current = formats;
  });

  const detect = useCallback(
    async (image: BarcodeDetectorSource): Promise<DetectedBarcode[] | undefined> => {
      const BarcodeDetectorCtor = getBarcodeDetectorConstructor();
      if (!BarcodeDetectorCtor) {
        return undefined;
      }
      const currentFormats = formatsRef.current;
      const detector = new BarcodeDetectorCtor(
        currentFormats ? { formats: currentFormats } : undefined,
      );
      return detector.detect(image);
    },
    [],
  );

  const getSupportedFormats = useCallback(async (): Promise<BarcodeFormat[] | undefined> => {
    const BarcodeDetectorCtor = getBarcodeDetectorConstructor();
    return BarcodeDetectorCtor ? BarcodeDetectorCtor.getSupportedFormats() : undefined;
  }, []);

  return { detect, getSupportedFormats, supported };
};
