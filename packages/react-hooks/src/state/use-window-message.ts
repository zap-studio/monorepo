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
 * Handles communication between windows, iframes, or popups from
 * different origins, using the `message` and `messageerror` events
 * (`postMessage()`). This is different from `useBroadcastChannel`: that
 * hook is for same-origin tabs talking by channel name, with no target or
 * origin check needed. This hook is for cross-origin windows, which need
 * an explicit `targetOrigin` on every message you send. Since any code on
 * the page can send a `message` event, you should always check the
 * origin when receiving one too. Pass `originFilter` to ignore messages
 * from other origins. Without it, every `message` event updates
 * `lastMessage`, just like the raw DOM event.
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
  useEffect(() => {
    originFilterRef.current = originFilter;
  });

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (originFilterRef.current !== undefined && event.origin !== originFilterRef.current) {
        return;
      }
      // SAFETY: T is a type you provide to describe the messages you expect on this channel. postMessage data has no shape TypeScript can check at runtime — this is the same trust boundary as MessageEvent.data, which TypeScript already types as any.
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
