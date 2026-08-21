import { useCallback, useEffect, useRef, useState } from "react";

/** One received message, as tracked by `useWindowMessage`. */
export interface WindowMessage<T> {
  data: T;
  origin: string;
  source: MessageEventSource | null;
}

/** The shape returned by `useWindowMessage`. */
export interface UseWindowMessageResult<T> {
  lastError: MessageEvent | undefined;
  lastMessage: WindowMessage<T> | undefined;
  postMessage: (targetWindow: Window, message: T, targetOrigin: string) => void;
}

/**
 * Cross-origin window/iframe/popup communication via the `message`/
 * `messageerror` events (`postMessage()`). Distinct from
 * `useBroadcastChannel`: that's same-origin tabs talking to each other by
 * channel name, with no target reference or origin check needed; this
 * handles cross-origin windows, which require an explicit `targetOrigin`
 * on every send and — since anything on the page can dispatch a `message`
 * event — should always be checked on receive too. Pass `originFilter` to
 * ignore messages from any other origin; without it, every `message`
 * event updates `lastMessage`, matching the raw DOM event.
 *
 * @example
 * ```tsx
 * const { lastMessage, postMessage } = useWindowMessage<string>("https://trusted.example");
 * postMessage(iframeRef.current!.contentWindow!, "hello", "https://trusted.example");
 * ```
 */
export const useWindowMessage = <T = unknown>(originFilter?: string): UseWindowMessageResult<T> => {
  const [lastMessage, setLastMessage] = useState<WindowMessage<T> | undefined>(undefined);
  const [lastError, setLastError] = useState<MessageEvent | undefined>(undefined);
  const originFilterRef = useRef(originFilter);
  originFilterRef.current = originFilter;

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (originFilterRef.current !== undefined && event.origin !== originFilterRef.current) {
        return;
      }
      // SAFETY: T is a caller-supplied type parameter describing the shape of messages expected on this channel — postMessage carries structured-clone data with no runtime-checkable shape, the same trust boundary TypeScript's own untyped MessageEvent.data (any) already has.
      setLastMessage({ data: event.data as T, origin: event.origin, source: event.source });
    };
    const handleMessageError = (event: MessageEvent) => setLastError(event);

    window.addEventListener("message", handleMessage);
    window.addEventListener("messageerror", handleMessageError);
    return () => {
      window.removeEventListener("message", handleMessage);
      window.removeEventListener("messageerror", handleMessageError);
    };
  }, []);

  const postMessage = useCallback((targetWindow: Window, message: T, targetOrigin: string) => {
    targetWindow.postMessage(message, targetOrigin);
  }, []);

  return { lastError, lastMessage, postMessage };
};
