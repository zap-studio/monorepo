import { useCallback, useEffect, useRef, useState } from "react";

/** Connection status reported by `useEventSource`. */
export type EventSourceStatus = "closed" | "connecting" | "open";

/** The shape returned by `useEventSource`. */
export interface UseEventSourceResult {
  close: () => void;
  data: string | undefined;
  status: EventSourceStatus;
}

/**
 * Server-Sent Events connection state (`"connecting" | "open" | "closed"`)
 * plus the latest `message` event's `data`, wrapping an `EventSource`
 * opened for `url` and torn down on unmount or when `url` changes. Pass
 * `undefined` to stay disconnected.
 *
 * @example
 * ```tsx
 * const { status, data } = useEventSource("https://example.com/stream");
 * ```
 */
export const useEventSource = (url: string | undefined): UseEventSourceResult => {
  const [status, setStatus] = useState<EventSourceStatus>(url ? "connecting" : "closed");
  const [data, setData] = useState<string | undefined>(undefined);
  const sourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!url) {
      setStatus("closed");
      return undefined;
    }

    const source = new EventSource(url);
    sourceRef.current = source;
    setStatus("connecting");

    const handleOpen = () => setStatus("open");
    // SAFETY: EventSource's message event always carries a UTF-8 text payload per spec; MessageEvent.data is typed `any` only because the same event type is reused by WebSocket/Worker for binary data.
    const handleMessage = (event: MessageEvent) => setData(event.data as string);
    const handleError = () => setStatus("closed");

    source.addEventListener("open", handleOpen);
    source.addEventListener("message", handleMessage);
    source.addEventListener("error", handleError);

    return () => {
      source.removeEventListener("open", handleOpen);
      source.removeEventListener("message", handleMessage);
      source.removeEventListener("error", handleError);
      source.close();
      sourceRef.current = null;
    };
  }, [url]);

  const close = useCallback((): void => {
    sourceRef.current?.close();
    setStatus("closed");
  }, []);

  return { close, data, status };
};
