import { useCallback, useEffect, useRef, useState } from "react";

import {
  getNdefReaderConstructor,
  type NDEFMessageSource,
  type NDEFReadingEvent,
  type NDEFRecord,
  type NDEFWriteOptions,
} from "./_web-nfc-api.ts";

export type {
  NDEFMessage,
  NDEFMessageSource,
  NDEFReadingEvent,
  NDEFRecord,
  NDEFRecordInit,
  NDEFWriteOptions,
} from "./_web-nfc-api.ts";

/** The most recent tag read while scanning. */
export interface NfcReading {
  records: readonly NDEFRecord[];
  serialNumber: string;
}

/** The shape returned by `useExperimentalNfc`. */
export interface UseExperimentalNfcResult {
  error: Error | undefined;
  makeReadOnly: () => Promise<boolean>;
  reading: NfcReading | undefined;
  scan: () => Promise<boolean>;
  scanning: boolean;
  stop: () => void;
  supported: boolean;
  write: (message: NDEFMessageSource, options?: NDEFWriteOptions) => Promise<boolean>;
}

const toError = (caught: unknown): Error =>
  caught instanceof Error ? caught : new Error(String(caught));

/**
 * Wraps the Web NFC API's `NDEFReader` — Experimental per MDN, Chromium on
 * Android only, and gated behind the `"nfc"` permission, a secure context,
 * and a user gesture. `scan()` prompts for that permission and starts
 * listening for tags, resolving `false` when the API is missing or the user
 * denies it; every tag that comes into range then updates `reading` with its
 * `serialNumber` and raw `records`. `stop()` aborts the scan. `write()` and
 * `makeReadOnly()` act on the next tag in range, each resolving `false`
 * rather than throwing when the tag can't be written. `error` holds the last
 * failure — a rejected call, or a tag that couldn't be decoded.
 *
 * Records are handed over undecoded: `data` is a `DataView`, so text records
 * are read with a `TextDecoder` built from the record's own `encoding`.
 *
 * @example
 * ```tsx
 * const { scan, reading, supported } = useExperimentalNfc();
 * <button onClick={() => scan()} disabled={!supported}>Scan a tag</button>;
 * {reading ? <p>Tag {reading.serialNumber}</p> : null}
 * ```
 */
export const useExperimentalNfc = (): UseExperimentalNfcResult => {
  const supported = Boolean(getNdefReaderConstructor());
  const [reading, setReading] = useState<NfcReading | undefined>(undefined);
  const [error, setError] = useState<Error | undefined>(undefined);
  const [scanning, setScanning] = useState(false);
  const cleanupRef = useRef<(() => void) | null>(null);

  const stop = useCallback(() => {
    cleanupRef.current?.();
    cleanupRef.current = null;
    setScanning(false);
  }, []);

  const scan = useCallback(async (): Promise<boolean> => {
    const NDEFReaderCtor = getNdefReaderConstructor();
    if (!NDEFReaderCtor) {
      return false;
    }

    cleanupRef.current?.();

    const abortController = new AbortController();
    const reader = new NDEFReaderCtor();

    const handleReading = (event: Event) => {
      // SAFETY: the "reading" event is always an NDEFReadingEvent per the Web NFC spec, but `addEventListener` on a bare EventTarget can only hand back the base `Event`.
      const { message, serialNumber } = event as NDEFReadingEvent;
      setReading({ records: message.records, serialNumber });
      setError(undefined);
    };
    const handleReadingError = () => {
      setError(new Error("The NFC tag in range could not be read."));
    };

    // oxlint-disable-next-line react-doctor/effect-needs-cleanup -- registered inside a user-triggered `scan()`, not the effect's mount body; `cleanupRef` (invoked here, in `stop()`, in the catch below, and on unmount by the effect further down) always removes these listeners, just via indirection the rule's matcher misses.
    reader.addEventListener("reading", handleReading);
    reader.addEventListener("readingerror", handleReadingError);
    cleanupRef.current = () => {
      abortController.abort();
      reader.removeEventListener("reading", handleReading);
      reader.removeEventListener("readingerror", handleReadingError);
    };

    try {
      await reader.scan({ signal: abortController.signal });
      setScanning(true);
      setError(undefined);
      return true;
    } catch (caught) {
      cleanupRef.current?.();
      cleanupRef.current = null;
      setScanning(false);
      setError(toError(caught));
      return false;
    }
  }, []);

  const write = useCallback(
    async (message: NDEFMessageSource, options?: NDEFWriteOptions): Promise<boolean> => {
      const NDEFReaderCtor = getNdefReaderConstructor();
      if (!NDEFReaderCtor) {
        return false;
      }
      try {
        await new NDEFReaderCtor().write(message, options);
        setError(undefined);
        return true;
      } catch (caught) {
        setError(toError(caught));
        return false;
      }
    },
    [],
  );

  const makeReadOnly = useCallback(async (): Promise<boolean> => {
    const NDEFReaderCtor = getNdefReaderConstructor();
    if (!NDEFReaderCtor) {
      return false;
    }
    try {
      await new NDEFReaderCtor().makeReadOnly();
      setError(undefined);
      return true;
    } catch (caught) {
      setError(toError(caught));
      return false;
    }
  }, []);

  useEffect(() => () => cleanupRef.current?.(), []);

  return { error, makeReadOnly, reading, scan, scanning, stop, supported, write };
};
