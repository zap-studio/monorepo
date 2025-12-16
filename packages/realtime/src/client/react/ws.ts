import { useCallback, useMemo } from "react";
import { WSClientTransport } from "../../transport/ws/client";
import type {
  ClientTransportOptions,
  EventDefinitions,
  EventKeys,
  InferEventTypes,
} from "../../types";
import {
  type UseTransportClientReturn,
  useTransportClient,
} from "../base/hooks/use-transport-client";
import { useTransportEventWithSend } from "../base/hooks/use-transport-event";
import { useTransportEventHistoryWithSend } from "../base/hooks/use-transport-event-history";

/**
 * useWebSocket hook options
 */
export type UseWebSocketOptions<TEventDefinitions extends EventDefinitions> =
  Omit<ClientTransportOptions<TEventDefinitions>, "definitions"> & {
    /**
     * Whether to connect on mount
     * @default true
     */
    enabled?: boolean;
    /**
     * Custom WebSocket protocols
     */
    protocols?: string | string[];
  };

/**
 * useWebSocket hook return type
 */
export type UseWebSocketReturn<TEventDefinitions extends EventDefinitions> =
  UseTransportClientReturn<TEventDefinitions> & {
    /** Send an event to the server */
    send: <TEvent extends EventKeys<TEventDefinitions>>(
      event: TEvent,
      data: InferEventTypes<TEventDefinitions>[TEvent]
    ) => void;
    /** Subscribe to a channel */
    subscribe: (channel: string) => void;
  };

/**
 * React hook for WebSocket connections
 *
 * Provides bidirectional communication with type-safe event handling.
 *
 * @example
 * ```tsx
 * import { z } from "zod";
 * import { useWebSocket } from "@zap-studio/realtime/client/react/ws";
 *
 * const MyEvents = {
 *   message: z.object({ content: z.string() }),
 *   notification: z.object({ title: z.string() }),
 * };
 *
 * function ChatComponent() {
 *   const { on, send, connected, error } = useWebSocket("wss://example.com/ws", MyEvents);
 *
 *   useEffect(() => {
 *     const unsubscribe = on("message", (msg) => {
 *       console.log("New message:", msg.content);
 *     });
 *     return unsubscribe;
 *   }, [on]);
 *
 *   const sendMessage = () => {
 *     send("message", { content: "Hello!" });
 *   };
 *
 *   if (error) return <div>Error: {error.message}</div>;
 *   if (!connected) return <div>Connecting...</div>;
 *
 *   return (
 *     <div>
 *       <button onClick={sendMessage}>Send</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useWebSocket<TEventDefinitions extends EventDefinitions>(
  url: string,
  definitions: TEventDefinitions,
  options?: UseWebSocketOptions<TEventDefinitions>
): UseWebSocketReturn<TEventDefinitions> {
  // Memoize options to prevent unnecessary re-renders
  const memoizedOptions = useMemo(() => options, [options]);

  const createClient = useMemo(
    () =>
      (
        _url: string,
        _definitions: TEventDefinitions,
        opts: UseWebSocketOptions<TEventDefinitions> | undefined
      ) =>
        new WSClientTransport(_url, {
          definitions: _definitions,
          validate: opts?.validate,
          reconnect: opts?.reconnect,
          protocols: opts?.protocols,
        }),
    []
  );

  const { client, connected, on, onAny, error, connect, disconnect } =
    useTransportClient(createClient, url, definitions, memoizedOptions);

  const send = useCallback(
    <TEvent extends EventKeys<TEventDefinitions>>(
      event: TEvent,
      data: InferEventTypes<TEventDefinitions>[TEvent]
    ): void => {
      client?.send(event, data);
    },
    [client]
  );

  const subscribe = useCallback(
    (channel: string): void => {
      client?.subscribe(channel);
    },
    [client]
  );

  return {
    connected,
    on,
    onAny,
    send,
    subscribe,
    error,
    connect,
    disconnect,
  };
}

/**
 * React hook for a single WebSocket event with sending capability
 *
 * @example
 * ```tsx
 * import { z } from "zod";
 * import { useWebSocketEvent } from "@zap-studio/realtime/client/react/ws";
 *
 * const MessageSchema = z.object({ content: z.string() });
 *
 * function MessageComponent() {
 *   const { data, send, connected } = useWebSocketEvent(
 *     "wss://example.com/ws",
 *     "message",
 *     { message: MessageSchema }
 *   );
 *
 *   return (
 *     <div>
 *       <p>Last message: {data?.content}</p>
 *       <button onClick={() => send({ content: "Hello!" })}>Send</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useWebSocketEvent<
  TEventDefinitions extends EventDefinitions,
  TEvent extends EventKeys<TEventDefinitions>,
>(
  url: string,
  event: TEvent,
  schemas: TEventDefinitions,
  options?: UseWebSocketOptions<TEventDefinitions>
): {
  data: InferEventTypes<TEventDefinitions>[TEvent] | null;
  send: (data: InferEventTypes<TEventDefinitions>[TEvent]) => void;
  connected: boolean;
  error: Error | null;
} {
  const wsClient = useWebSocket(url, schemas, options);
  return useTransportEventWithSend(event, wsClient);
}

/**
 * React hook for collecting WebSocket events into an array with sending capability
 *
 * @example
 * ```tsx
 * import { z } from "zod";
 * import { useWebSocketEventHistory } from "@zap-studio/realtime/client/react/ws";
 *
 * function ChatComponent() {
 *   const { events, send, clear, connected } = useWebSocketEventHistory(
 *     "wss://example.com/ws",
 *     "message",
 *     { message: z.object({ content: z.string(), sender: z.string() }) },
 *     { maxEvents: 100 }
 *   );
 *
 *   return (
 *     <div>
 *       {events.map((msg, i) => (
 *         <div key={i}>{msg.sender}: {msg.content}</div>
 *       ))}
 *       <button onClick={() => send({ content: "Hello!", sender: "Me" })}>
 *         Send
 *       </button>
 *       <button onClick={clear}>Clear</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useWebSocketEventHistory<
  TEventDefinitions extends EventDefinitions,
  TEvent extends EventKeys<TEventDefinitions>,
>(
  url: string,
  event: TEvent,
  schemas: TEventDefinitions,
  options?: UseWebSocketOptions<TEventDefinitions> & {
    /**
     * Maximum number of events to keep
     * @default 100
     */
    maxEvents?: number;
  }
): {
  events: InferEventTypes<TEventDefinitions>[TEvent][];
  send: (data: InferEventTypes<TEventDefinitions>[TEvent]) => void;
  connected: boolean;
  error: Error | null;
  clear: () => void;
} {
  const maxEvents = options?.maxEvents ?? 100;
  const wsClient = useWebSocket(url, schemas, options);
  return useTransportEventHistoryWithSend(event, wsClient, maxEvents);
}
