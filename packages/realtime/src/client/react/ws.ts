import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { WSClientTransport } from "../../transport/ws/client";
import type {
  ClientTransportOptions,
  EventDefinitions,
  EventKeys,
  InferEventTypes,
} from "../../types";

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
export type UseWebSocketReturn<TEventDefinitions extends EventDefinitions> = {
  /** Whether currently connected */
  connected: boolean;
  /** Register event handler */
  on: <TEvent extends EventKeys<TEventDefinitions>>(
    event: TEvent,
    handler: (data: InferEventTypes<TEventDefinitions>[TEvent]) => void
  ) => () => void;
  /** Register handler for all events */
  onAny: (
    handler: <TEvent extends EventKeys<TEventDefinitions>>(
      event: TEvent,
      data: InferEventTypes<TEventDefinitions>[TEvent]
    ) => void
  ) => () => void;
  /** Send an event to the server */
  send: <TEvent extends EventKeys<TEventDefinitions>>(
    event: TEvent,
    data: InferEventTypes<TEventDefinitions>[TEvent]
  ) => void;
  /** Subscribe to a channel */
  subscribe: (channel: string) => void;
  /** Last error if any */
  error: Error | null;
  /** Manually connect */
  connect: () => void;
  /** Manually disconnect */
  disconnect: () => void;
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
  const enabled = options?.enabled ?? true;
  const clientRef = useRef<WSClientTransport<TEventDefinitions> | null>(null);
  const [error, setError] = useState<Error | null>(null);

  // Track connection state for useSyncExternalStore
  const connectionSubscribersRef = useRef<Set<() => void>>(new Set());
  const connectedRef = useRef(false);

  const subscribe = useCallback((callback: () => void) => {
    connectionSubscribersRef.current.add(callback);
    return () => {
      connectionSubscribersRef.current.delete(callback);
    };
  }, []);

  const getSnapshot = useCallback(() => connectedRef.current, []);
  const getServerSnapshot = useCallback(() => false, []);

  const connected = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );

  // Initialize client
  useEffect(() => {
    if (!enabled) {
      return;
    }

    const client = new WSClientTransport(url, {
      definitions,
      validate: options?.validate,
      reconnect: options?.reconnect,
      protocols: options?.protocols,
    });

    clientRef.current = client;

    // Track connection changes
    const unsubConnection = client.onConnectionChange((isConnected) => {
      connectedRef.current = isConnected;
      for (const subscriber of connectionSubscribersRef.current) {
        subscriber();
      }
    });

    // Track errors
    const unsubError = client.onError((err) => {
      setError(err);
    });

    // Connect
    client.connect();

    return () => {
      unsubConnection();
      unsubError();
      client.disconnect();
      clientRef.current = null;
      connectedRef.current = false;
    };
  }, [
    url,
    definitions,
    enabled,
    options?.validate,
    options?.reconnect,
    options?.protocols,
  ]);

  // Store pending handlers that were registered before client was ready
  const pendingHandlersRef = useRef<
    Map<
      EventKeys<TEventDefinitions>,
      Set<
        (
          data: InferEventTypes<TEventDefinitions>[EventKeys<TEventDefinitions>]
        ) => void
      >
    >
  >(new Map());
  const pendingAnyHandlersRef = useRef<
    Set<
      <TEvent extends EventKeys<TEventDefinitions>>(
        event: TEvent,
        data: InferEventTypes<TEventDefinitions>[TEvent]
      ) => void
    >
  >(new Set());

  // Register pending handlers when client becomes available
  useEffect(() => {
    const client = clientRef.current;
    if (!client) return;

    const unsubscribes: (() => void)[] = [];

    // Register pending event handlers
    for (const [event, handlers] of pendingHandlersRef.current) {
      for (const handler of handlers) {
        unsubscribes.push(client.on(event, handler));
      }
    }

    // Register pending any handlers
    for (const handler of pendingAnyHandlersRef.current) {
      unsubscribes.push(client.onAny(handler));
    }

    return () => {
      for (const unsub of unsubscribes) {
        unsub();
      }
    };
  }, [connected]);

  const on = useCallback(
    <TEvent extends EventKeys<TEventDefinitions>>(
      event: TEvent,
      handler: (data: InferEventTypes<TEventDefinitions>[TEvent]) => void
    ): (() => void) => {
      const client = clientRef.current;

      if (client) {
        return client.on(event, handler);
      }

      // Client not ready, store for later
      let handlers = pendingHandlersRef.current.get(event);
      if (!handlers) {
        handlers = new Set();
        pendingHandlersRef.current.set(event, handlers);
      }
      handlers.add(handler);

      return () => {
        handlers?.delete(handler);
        if (handlers?.size === 0) {
          pendingHandlersRef.current.delete(event);
        }
      };
    },
    []
  );

  const onAny = useCallback(
    (
      handler: <TEvent extends EventKeys<TEventDefinitions>>(
        event: TEvent,
        data: InferEventTypes<TEventDefinitions>[TEvent]
      ) => void
    ): (() => void) => {
      const client = clientRef.current;

      if (client) {
        return client.onAny(handler);
      }

      // Client not ready, store for later
      pendingAnyHandlersRef.current.add(handler);

      return () => {
        pendingAnyHandlersRef.current.delete(handler);
      };
    },
    []
  );

  const send = useCallback(
    <TEvent extends EventKeys<TEventDefinitions>>(
      event: TEvent,
      data: InferEventTypes<TEventDefinitions>[TEvent]
    ): void => {
      clientRef.current?.send(event, data);
    },
    []
  );

  const subscribeToChannel = useCallback((channel: string): void => {
    clientRef.current?.subscribe(channel);
  }, []);

  const connect = useCallback(() => {
    clientRef.current?.connect();
  }, []);

  const disconnect = useCallback(() => {
    clientRef.current?.disconnect();
  }, []);

  return {
    connected,
    on,
    onAny,
    send,
    subscribe: subscribeToChannel,
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
  const [data, setData] = useState<
    InferEventTypes<TEventDefinitions>[TEvent] | null
  >(null);
  const {
    on,
    send: wsSend,
    connected,
    error,
  } = useWebSocket(url, schemas, options);

  useEffect(() => {
    const unsubscribe = on(event, (eventData) => {
      setData(eventData);
    });
    return unsubscribe;
  }, [on, event]);

  const send = useCallback(
    (eventData: InferEventTypes<TEventDefinitions>[TEvent]) => {
      wsSend(event, eventData);
    },
    [wsSend, event]
  );

  return { data, send, connected, error };
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
  const [events, setEvents] = useState<
    InferEventTypes<TEventDefinitions>[TEvent][]
  >([]);
  const {
    on,
    send: wsSend,
    connected,
    error,
  } = useWebSocket(url, schemas, options);

  useEffect(() => {
    const unsubscribe = on(event, (eventData) => {
      setEvents((prev) => {
        const next = [...prev, eventData];
        if (next.length > maxEvents) {
          return next.slice(-maxEvents);
        }
        return next;
      });
    });
    return unsubscribe;
  }, [on, event, maxEvents]);

  const send = useCallback(
    (eventData: InferEventTypes<TEventDefinitions>[TEvent]) => {
      wsSend(event, eventData);
    },
    [wsSend, event]
  );

  const clear = useCallback(() => {
    setEvents([]);
  }, []);

  return { events, send, connected, error, clear };
}
