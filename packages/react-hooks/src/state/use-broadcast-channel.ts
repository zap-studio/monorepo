import { useCallback, useEffect, useRef, useState } from "react";

/** The shape returned by `useBroadcastChannel`. */
export interface UseBroadcastChannelResult<T> {
  lastMessage: T | undefined;
  postMessage: (message: T) => void;
  supported: boolean;
}

const isSupported = (): boolean => typeof BroadcastChannel !== "undefined";

/**
 * Shares state across same-origin tabs, windows, and workers using the
 * Broadcast Channel API. Every `useBroadcastChannel(name)` instance with
 * the same name and origin gets the message when one of them calls
 * `postMessage()`. This is different from `useWindowMessage`: that hook
 * is for cross-origin windows and needs a target and an origin, while
 * this hook works by channel name only, within the same origin. If the
 * browser doesn't support the Broadcast Channel API, `supported` is
 * `false` and `postMessage()` does nothing.
 *
 * @example
 * ```tsx
 * const { lastMessage, postMessage } = useBroadcastChannel<string>("cart-updates");
 * postMessage("item-added");
 * ```
 */
export const useBroadcastChannel = <T>(name: string): UseBroadcastChannelResult<T> => {
  const [lastMessage, setLastMessage] = useState<T | undefined>(undefined);
  const channelRef = useRef<BroadcastChannel | null>(null);
  const supported = isSupported();

  useEffect(() => {
    if (!isSupported()) {
      return undefined;
    }

    const channel = new BroadcastChannel(name);
    channelRef.current = channel;

    const handleMessage = (event: MessageEvent<T>) => setLastMessage(event.data);
    channel.addEventListener("message", handleMessage);

    return () => {
      channel.removeEventListener("message", handleMessage);
      channel.close();
      channelRef.current = null;
    };
  }, [name]);

  const postMessage = useCallback((message: T) => {
    channelRef.current?.postMessage(message);
  }, []);

  return { lastMessage, postMessage, supported };
};
