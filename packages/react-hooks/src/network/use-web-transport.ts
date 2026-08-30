import { useCallback, useEffect, useRef, useState } from "react";

/** Connection status reported by `useWebTransport`. */
export type WebTransportStatus = "closed" | "connected" | "connecting";

/** The shape returned by `useWebTransport`. */
export interface UseWebTransportResult {
  close: (closeInfo?: WebTransportCloseInfo) => void;
  createBidirectionalStream: () => Promise<WebTransportBidirectionalStream | undefined>;
  createUnidirectionalStream: () => Promise<WritableStream | undefined>;
  error: Error | undefined;
  lastDatagram: Uint8Array | undefined;
  sendDatagram: (data: Uint8Array) => Promise<boolean>;
  status: WebTransportStatus;
  supported: boolean;
}

const isSupported = (): boolean => typeof WebTransport !== "undefined";

const toError = (caught: unknown): Error =>
  caught instanceof Error ? caught : new Error(String(caught));

/**
 * Wraps the WebTransport API. This is an HTTP/3 connection to a server
 * that supports both reliable and unreliable data transport, in both
 * directions. Tracks the connection status
 * (`"connecting" | "connected" | "closed"`), wrapping a `WebTransport`
 * opened for `url` (an `"https://"` URL with an explicit port). The
 * connection closes when the component unmounts or when `url` changes.
 * Pass `undefined` to stay disconnected, for example while waiting for a
 * session token.
 *
 * `sendDatagram()` and `lastDatagram` handle the unreliable datagram
 * channel: a writer stays open for the whole connection, and the hook
 * keeps the most recently received chunk, similar to `useWebSocket`'s
 * `lastMessage`. `createBidirectionalStream()` and
 * `createUnidirectionalStream()` open a reliable stream when you need
 * one, and return the raw Web Streams objects so you can read and write
 * directly.
 *
 * Returns `supported: false` when the API doesn't exist, such as during
 * server rendering. See
 * [MDN's browser compatibility table](https://developer.mozilla.org/en-US/docs/Web/API/WebTransport#browser_compatibility).
 *
 * @example
 * ```tsx
 * const { status, lastDatagram, sendDatagram } = useWebTransport("https://example.com:4999/wt");
 * if (status === "connected") await sendDatagram(new TextEncoder().encode("ping"));
 * ```
 */
export const useWebTransport = (
  url: string | undefined,
  options?: WebTransportOptions,
): UseWebTransportResult => {
  const supported = isSupported();
  const [status, setStatus] = useState<WebTransportStatus>(url ? "connecting" : "closed");
  const [error, setError] = useState<Error | undefined>(undefined);
  const [lastDatagram, setLastDatagram] = useState<Uint8Array | undefined>(undefined);
  const transportRef = useRef<WebTransport | null>(null);
  const writerRef = useRef<WritableStreamDefaultWriter | null>(null);
  const optionsRef = useRef(options);
  useEffect(() => {
    optionsRef.current = options;
  });

  // oxlint-disable-next-line react-doctor/no-set-state-after-await-in-effect -- every state update after an `await` here (in `readDatagrams`, `waitForReady`, `waitForClose`) checks `if (!controller.signal.aborted)` first. The cleanup function calls `controller.abort()` before anything else, so a re-run caused by `url` changing can never write stale state.
  useEffect(() => {
    if (!url || !isSupported()) {
      // oxlint-disable-next-line react/set-state-in-effect -- we need this when `url` changes from a value to `undefined` after mount. It closes a transport that was open. On mount with no `url`, this call does nothing, because the state is already "closed".
      setStatus("closed");
      return undefined;
    }

    const controller = new AbortController();
    const transport = new WebTransport(url, optionsRef.current);
    transportRef.current = transport;
    setStatus("connecting");
    setError(undefined);

    // `WebTransportDatagramDuplexStream.readable` is declared without a type
    // parameter, so its reader defaults to `any`. The spec guarantees
    // `Uint8Array` chunks; pinning it here types `value` for the loop below.
    const reader: ReadableStreamDefaultReader<Uint8Array> =
      transport.datagrams.readable.getReader();
    const writer = transport.datagrams.writable.getWriter();
    writerRef.current = writer;

    const readDatagrams = async (): Promise<void> => {
      try {
        for (;;) {
          const { done, value } = await reader.read();
          if (done) {
            return;
          }
          if (!controller.signal.aborted) {
            setLastDatagram(value);
          }
        }
      } catch {
        // The reader was cancelled by cleanup, or the connection dropped. Either way, `transport.closed` below reports it.
      }
    };
    void readDatagrams();

    const waitForReady = async (): Promise<void> => {
      try {
        await transport.ready;
        if (!controller.signal.aborted) {
          setStatus("connected");
        }
      } catch (caught) {
        if (!controller.signal.aborted) {
          setStatus("closed");
          setError(toError(caught));
        }
      }
    };
    void waitForReady();

    const waitForClose = async (): Promise<void> => {
      try {
        await transport.closed;
        if (!controller.signal.aborted) {
          setStatus("closed");
        }
      } catch (caught) {
        if (!controller.signal.aborted) {
          setStatus("closed");
          setError(toError(caught));
        }
      }
    };
    void waitForClose();

    return () => {
      controller.abort();
      const cancelReader = async (): Promise<void> => {
        try {
          await reader.cancel();
        } catch {
          // already closing
        }
      };
      void cancelReader();
      writer.releaseLock();
      transport.close();
      transportRef.current = null;
      writerRef.current = null;
    };
  }, [url]);

  const sendDatagram = useCallback(async (data: Uint8Array): Promise<boolean> => {
    const writer = writerRef.current;
    if (!writer) {
      return false;
    }
    try {
      await writer.write(data);
      return true;
    } catch (caught) {
      setError(toError(caught));
      return false;
    }
  }, []);

  const createBidirectionalStream = useCallback(async (): Promise<
    WebTransportBidirectionalStream | undefined
  > => {
    const transport = transportRef.current;
    if (!transport) {
      return undefined;
    }
    try {
      return await transport.createBidirectionalStream();
    } catch (caught) {
      setError(toError(caught));
      return undefined;
    }
  }, []);

  const createUnidirectionalStream = useCallback(async (): Promise<WritableStream | undefined> => {
    const transport = transportRef.current;
    if (!transport) {
      return undefined;
    }
    try {
      return await transport.createUnidirectionalStream();
    } catch (caught) {
      setError(toError(caught));
      return undefined;
    }
  }, []);

  const close = useCallback((closeInfo?: WebTransportCloseInfo): void => {
    transportRef.current?.close(closeInfo);
  }, []);

  return {
    close,
    createBidirectionalStream,
    createUnidirectionalStream,
    error,
    lastDatagram,
    sendDatagram,
    status,
    supported,
  };
};
