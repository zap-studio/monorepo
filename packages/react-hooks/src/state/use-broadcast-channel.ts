import { useCallback, useEffect, useRef, useState } from "react";

/** The shape returned by `useBroadcastChannel`. */
export interface UseBroadcastChannelResult<T> {
  lastMessage: T | undefined;
  postMessage: (message: T) => void;
  supported: boolean;
}

const isSupported = (): boolean => typeof BroadcastChannel !== "undefined";

/**
 * Pub/sub state shared across same-origin tabs/windows/workers via the
 * Broadcast Channel API — every `useBroadcastChannel(name)` instance
 * (in any same-origin browsing context, including this one) that posts a
 * message updates every other instance's `lastMessage`. Distinct from
 * `useWindowMessage`: this needs no target reference or origin handshake
 * (same-origin, name-addressed), while that handles cross-origin
 * window/iframe/popup communication where an explicit `targetOrigin` is
 * required. `supported: false` — with `postMessage()` no-oping — where
 * the Broadcast Channel API doesn't exist.
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
