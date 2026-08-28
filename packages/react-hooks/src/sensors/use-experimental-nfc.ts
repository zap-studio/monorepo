import { useCallback, useEffect, useState } from "react";

import {
  getNdefReaderConstructor,
  type NDEFMessageSource,
  type NDEFReader,
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

/** A scanning session: the reader plus the `AbortSignal` controller that stops it. */
interface NfcSession {
  abortController: AbortController;
  reader: NDEFReader;
}

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
 * Reads and writes NFC tags, using the Web NFC API's `NDEFReader`. This is
 * experimental and only works in Chrome on Android. It needs the `"nfc"`
 * permission, a secure (HTTPS) page, and a user gesture (like a button
 * click) to start.
 *
 * Call `scan()` to ask for that permission and start listening for tags.
 * It resolves `false` if the API isn't available or the user says no.
 * Each time a tag comes into range, `reading` updates with its
 * `serialNumber` and raw `records`. Call `stop()` to stop scanning.
 *
 * `write()` and `makeReadOnly()` act on the next tag that comes into
 * range. Both resolve `false` instead of throwing when the tag can't be
 * written. `error` holds the last failure, such as a rejected call or a
 * tag that couldn't be read.
 *
 * Records come back undecoded: `data` is a `DataView`. To read a text
 * record, decode it with a `TextDecoder` using the record's own
 * `encoding`.
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
  const [session, setSession] = useState<NfcSession | null>(null);

  const stop = useCallback(() => {
    setSession(null);
    setScanning(false);
  }, []);

  const scan = useCallback(async (): Promise<boolean> => {
    const NDEFReaderCtor = getNdefReaderConstructor();
    if (!NDEFReaderCtor) {
      return false;
    }

    const abortController = new AbortController();
    const reader = new NDEFReaderCtor();

    try {
      await reader.scan({ signal: abortController.signal });
      setSession({ abortController, reader });
      setScanning(true);
      setError(undefined);
      return true;
    } catch (caught) {
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

  useEffect(() => {
    if (!session) {
      return undefined;
    }
    const { abortController, reader } = session;
    const handleReading = (event: NDEFReadingEvent) => {
      const { message, serialNumber } = event;
      setReading({ records: message.records, serialNumber });
      setError(undefined);
    };
    const handleReadingError = () => {
      setError(new Error("The NFC tag in range could not be read."));
    };

    reader.addEventListener("reading", handleReading);
    reader.addEventListener("readingerror", handleReadingError);
    return () => {
      abortController.abort();
      reader.removeEventListener("reading", handleReading);
      reader.removeEventListener("readingerror", handleReadingError);
    };
  }, [session]);

  return { error, makeReadOnly, reading, scan, scanning, stop, supported, write };
};
