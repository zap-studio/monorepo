/** Minimal local model of the Web NFC API — Experimental per MDN, Chromium-on-Android-only, not declared in every TypeScript DOM lib. */

/** A single NDEF record, as carried by a scanned message's `records`. */
export interface NDEFRecord {
  readonly data?: DataView;
  readonly encoding?: string;
  readonly id?: string;
  readonly lang?: string;
  readonly mediaType?: string;
  readonly recordType: string;
}

/** The NDEF message a `reading` event carries — an ordered list of records. */
export interface NDEFMessage {
  readonly records: readonly NDEFRecord[];
}

/** A record as written, before the tag encodes it. */
export interface NDEFRecordInit {
  data?: unknown;
  encoding?: string;
  id?: string;
  lang?: string;
  mediaType?: string;
  recordType: string;
}

/** Anything `NDEFReader.write()` accepts — a string, raw bytes, or an explicit record list. */
export type NDEFMessageSource =
  | ArrayBuffer
  | ArrayBufferView
  | string
  | { records: NDEFRecordInit[] };

/** Options `NDEFReader.write()` accepts, beyond the message itself. */
export interface NDEFWriteOptions {
  overwrite?: boolean;
}

/** The `reading` event, carrying the scanned message and the tag's serial number. */
export interface NDEFReadingEvent extends Event {
  readonly message: NDEFMessage;
  readonly serialNumber: string;
}

interface NDEFReader extends EventTarget {
  makeReadOnly(options?: { signal?: AbortSignal }): Promise<void>;
  scan(options?: { signal?: AbortSignal }): Promise<void>;
  write(
    message: NDEFMessageSource,
    options?: NDEFWriteOptions & { signal?: AbortSignal },
  ): Promise<void>;
}

interface NDEFReaderConstructor {
  new (): NDEFReader;
}

interface WebNfcWindow {
  NDEFReader?: NDEFReaderConstructor;
}

export type { NDEFReader, NDEFReaderConstructor };

/**
 * Guards `typeof window === "undefined"` because `useExperimentalNfc`
 * reads this synchronously in the hook body, on every render including SSR —
 * not just from an effect.
 */
export const getNdefReaderConstructor = (): NDEFReaderConstructor | undefined => {
  if (typeof window === "undefined") {
    return undefined;
  }
  // SAFETY: window.NDEFReader is read as optional here regardless of how (or whether) the resolved TypeScript version's DOM lib declares it, so a browser where it's genuinely absent (Safari, Firefox, desktop Chrome) degrades to undefined rather than throwing.
  return (window as WebNfcWindow).NDEFReader;
};
