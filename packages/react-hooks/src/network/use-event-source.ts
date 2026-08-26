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
 * Tracks a Server-Sent Events connection state
 * (`"connecting" | "open" | "closed"`) and the latest `message` event's
 * `data`. It wraps an `EventSource` opened for `url`, and closes it when
 * the component unmounts or when `url` changes. Pass `undefined` to stay
 * disconnected.
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
    const handleMessage = (event: MessageEvent<string>) => setData(event.data);
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
