/**
 * A small local type definition for the Barcode Detection API. MDN marks
 * this API as experimental. It only works in Chromium browsers, and not
 * every version of TypeScript's DOM types includes it.
 */
export type BarcodeFormat =
  | "aztec"
  | "codabar"
  | "code_128"
  | "code_39"
  | "code_93"
  | "data_matrix"
  | "ean_13"
  | "ean_8"
  | "itf"
  | "pdf417"
  | "qr_code"
  | "unknown"
  | "upc_a"
  | "upc_e";

/** A single barcode found by `BarcodeDetector.detect()`. */
export interface DetectedBarcode {
  readonly boundingBox: DOMRectReadOnly;
  readonly cornerPoints: readonly { x: number; y: number }[];
  readonly format: BarcodeFormat;
  readonly rawValue: string;
}

/** The image sources `BarcodeDetector.detect()` accepts. */
export type BarcodeDetectorSource =
  | Blob
  | HTMLCanvasElement
  | HTMLImageElement
  | HTMLVideoElement
  | ImageBitmap
  | ImageData
  | OffscreenCanvas
  | SVGImageElement;

interface BarcodeDetector {
  detect(image: BarcodeDetectorSource): Promise<DetectedBarcode[]>;
}

interface BarcodeDetectorConstructor {
  new (options?: { formats?: BarcodeFormat[] }): BarcodeDetector;
  getSupportedFormats(): Promise<BarcodeFormat[]>;
}

interface BarcodeDetectionWindow {
  BarcodeDetector?: BarcodeDetectorConstructor;
}

/**
 * Checks `typeof window === "undefined"` first. `useExperimentalBarcodeDetector`
 * calls this directly in the hook body on every render, including during
 * server-side rendering, not only inside an effect.
 */
export const getBarcodeDetectorConstructor = (): BarcodeDetectorConstructor | undefined => {
  if (typeof window === "undefined") {
    return undefined;
  }
  // SAFETY: We read window.BarcodeDetector as optional, no matter what the TypeScript DOM types say. This way, browsers that don't have it (like Safari or Firefox) just return undefined instead of throwing an error.
  return (window as BarcodeDetectionWindow).BarcodeDetector;
};
