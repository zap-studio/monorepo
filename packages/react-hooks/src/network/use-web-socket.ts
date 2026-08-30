import { useCallback, useEffect, useRef, useState } from "react";

/** Connection status reported by `useWebSocket`. */
export type WebSocketStatus = "closed" | "connecting" | "open";

/** The shape returned by `useWebSocket`. */
export interface UseWebSocketResult {
  close: () => void;
  lastMessage: MessageEvent | undefined;
  send: (data: Parameters<WebSocket["send"]>[0]) => void;
  status: WebSocketStatus;
}

/**
 * Tracks a WebSocket connection state (`"connecting" | "open" | "closed"`)
 * and gives you `send()`/`close()` functions. It wraps a `WebSocket`
 * opened for `url`, and closes it when the component unmounts or when
 * `url` changes. Pass `undefined` to stay disconnected, for example
 * while waiting for an auth token.
 *
 * @example
 * ```tsx
 * const { status, lastMessage, send } = useWebSocket("wss://example.com");
 * if (status === "open") send("ping");
 * ```
 */
export const useWebSocket = (url: string | undefined): UseWebSocketResult => {
  const [status, setStatus] = useState<WebSocketStatus>(url ? "connecting" : "closed");
  const [lastMessage, setLastMessage] = useState<MessageEvent | undefined>(undefined);
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!url) {
      // oxlint-disable-next-line react/set-state-in-effect -- we need this when `url` changes from a value to `undefined` after mount. It closes a socket that was open. On mount with no `url`, this call does nothing, because the state is already "closed".
      setStatus("closed");
      return undefined;
    }

    const socket = new WebSocket(url);
    socketRef.current = socket;
    setStatus("connecting");

    const handleOpen = () => setStatus("open");
    const handleClose = () => setStatus("closed");
    const handleError = () => setStatus("closed");
    const handleMessage = (event: MessageEvent) => setLastMessage(event);

    socket.addEventListener("open", handleOpen);
    socket.addEventListener("close", handleClose);
    socket.addEventListener("error", handleError);
    socket.addEventListener("message", handleMessage);

    return () => {
      socket.removeEventListener("open", handleOpen);
      socket.removeEventListener("close", handleClose);
      socket.removeEventListener("error", handleError);
      socket.removeEventListener("message", handleMessage);
      socket.close();
      socketRef.current = null;
    };
  }, [url]);

  const send = useCallback((data: Parameters<WebSocket["send"]>[0]): void => {
    socketRef.current?.send(data);
  }, []);

  const close = useCallback((): void => {
    socketRef.current?.close();
  }, []);

  return { close, lastMessage, send, status };
};
