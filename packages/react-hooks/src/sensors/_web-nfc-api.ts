/** A small copy of the Web NFC API's types. This is an experimental API, only in Chrome on Android, and not included in TypeScript's built-in types. */

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
 * Checks `typeof window === "undefined"`. `useExperimentalNfc` reads this
 * directly in the hook body on every render, including server-side
 * rendering, not only inside an effect.
 */
export const getNdefReaderConstructor = (): NDEFReaderConstructor | undefined => {
  if (typeof window === "undefined") {
    return undefined;
  }
  // SAFETY: window.NDEFReader is read as optional here, no matter what the current TypeScript DOM lib declares. On a browser that truly lacks it (like Safari, Firefox, or desktop Chrome), this reads as undefined instead of throwing.
  return (window as WebNfcWindow).NDEFReader;
};
