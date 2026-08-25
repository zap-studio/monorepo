/** Minimal local model of the Barcode Detection API — Experimental per MDN, Chromium-only, not declared in every TypeScript DOM lib. */
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
 * Guards `typeof window === "undefined"` because `useExperimentalBarcodeDetector`
 * reads this synchronously in the hook body, on every render including SSR —
 * not just from an effect.
 */
export const getBarcodeDetectorConstructor = (): BarcodeDetectorConstructor | undefined => {
  if (typeof window === "undefined") {
    return undefined;
  }
  // SAFETY: window.BarcodeDetector is read as optional here regardless of how (or whether) the resolved TypeScript version's DOM lib declares it, so a browser where it's genuinely absent (Safari, Firefox) degrades to undefined rather than throwing.
  return (window as BarcodeDetectionWindow).BarcodeDetector;
};
