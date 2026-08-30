/** A small copy of the Web NFC API's types. This is an experimental API, only in Chrome on Android, not declared elsewhere. */

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

/** The events an `NDEFReader` dispatches, keyed by event name. */
interface NDEFReaderEventMap {
  reading: NDEFReadingEvent;
  readingerror: Event;
}

interface NDEFReader extends EventTarget {
  addEventListener<K extends keyof NDEFReaderEventMap>(
    type: K,
    listener: (this: NDEFReader, event: NDEFReaderEventMap[K]) => void,
    options?: AddEventListenerOptions | boolean,
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: AddEventListenerOptions | boolean,
  ): void;
  makeReadOnly(options?: { signal?: AbortSignal }): Promise<void>;
  removeEventListener<K extends keyof NDEFReaderEventMap>(
    type: K,
    listener: (this: NDEFReader, event: NDEFReaderEventMap[K]) => void,
    options?: EventListenerOptions | boolean,
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: EventListenerOptions | boolean,
  ): void;
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
  // SAFETY: NDEFReader is not declared on Window. We read it as optional, so a browser without support (Safari, Firefox, desktop Chrome) gives undefined instead of throwing.
  return (window as WebNfcWindow).NDEFReader;
};
