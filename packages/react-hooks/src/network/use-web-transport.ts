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
 * Wraps the WebTransport API — an HTTP/3 connection to a server offering
 * reliable and unreliable, bidirectional and unidirectional data transport.
 * Connection status (`"connecting" | "connected" | "closed"`), wrapping a
 * `WebTransport` opened for `url` (an `"https://"` URL with an explicit
 * port) and torn down on unmount or when `url` changes. Pass `undefined`
 * to stay disconnected (e.g. before a session token is ready).
 *
 * `sendDatagram()`/`lastDatagram` cover the unreliable datagram channel —
 * a persistent writer is held open for the life of the connection, and the
 * latest received chunk is kept, mirroring `useWebSocket`'s `lastMessage`.
 * `createBidirectionalStream()`/`createUnidirectionalStream()` open a
 * reliable stream on demand, handed back as the raw Web Streams objects
 * for the caller to read/write directly.
 *
 * `supported: false` — the SSR-safe default — where the API doesn't exist;
 * see [MDN's browser compatibility table](https://developer.mozilla.org/en-US/docs/Web/API/WebTransport#browser_compatibility).
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

  useEffect(() => {
    if (!url || !isSupported()) {
      setStatus("closed");
      return undefined;
    }

    let cancelled = false;
    const transport = new WebTransport(url, optionsRef.current);
    transportRef.current = transport;
    setStatus("connecting");
    setError(undefined);

    const reader = transport.datagrams.readable.getReader();
    const writer = transport.datagrams.writable.getWriter();
    writerRef.current = writer;

    const readDatagrams = async (): Promise<void> => {
      try {
        for (;;) {
          const { done, value } = await reader.read();
          if (done || cancelled) {
            return;
          }
          // SAFETY: WebTransportDatagramDuplexStream's readable always yields Uint8Array chunks per spec; ReadableStream.read()'s `value` is typed `any` only because the interface is declared without a type parameter.
          setLastDatagram(value as Uint8Array);
        }
      } catch {
        // reader cancelled by cleanup, or the connection dropped — surfaced via `transport.closed` below
      }
    };
    void readDatagrams();

    const waitForReady = async (): Promise<void> => {
      try {
        await transport.ready;
        if (!cancelled) {
          setStatus("connected");
        }
      } catch (caught) {
        if (!cancelled) {
          setStatus("closed");
          setError(toError(caught));
        }
      }
    };
    void waitForReady();

    const waitForClose = async (): Promise<void> => {
      try {
        await transport.closed;
        if (!cancelled) {
          setStatus("closed");
        }
      } catch (caught) {
        if (!cancelled) {
          setStatus("closed");
          setError(toError(caught));
        }
      }
    };
    void waitForClose();

    return () => {
      cancelled = true;
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
