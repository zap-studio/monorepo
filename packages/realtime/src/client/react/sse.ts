import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { SSEClientTransport } from "../../transport/sse/client";
import type {
  ClientTransportOptions,
  EventDefinitions,
  EventKeys,
  InferEventTypes,
} from "../../types";

/**
 * useSSE hook options
 */
export type UseSSEOptions<TEventDefinitions extends EventDefinitions> = Omit<
  ClientTransportOptions<TEventDefinitions>,
  "definitions"
> & {
  /**
   * Whether to connect on mount
   * @default true
   */
  enabled?: boolean;
};

/**
 * useSSE hook return type
 */
export type UseSSEReturn<TEventDefinitions extends EventDefinitions> = {
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
  /** Last error if any */
  error: Error | null;
  /** Manually connect */
  connect: () => void;
  /** Manually disconnect */
  disconnect: () => void;
};

/**
 * React hook for subscribing to SSE events
 *
 * @example
 * ```tsx
 * import { z } from "zod";
 * import { useSSE } from "@zap-studio/realtime/client/react/sse";
 *
 * const MyEvents = {
 *   message: z.object({ title: z.string(), body: z.string() }),
 *   notification: z.object({ type: z.string(), text: z.string() }),
 * };
 *
 * function ChatComponent() {
 *   const { on, connected, error } = useSSE("/api/events", MyEvents);
 *
 *   useEffect(() => {
 *     const unsubscribe = on("message", (msg) => {
 *       console.log("New message:", msg.title);
 *     });
 *     return unsubscribe;
 *   }, [on]);
 *
 *   if (error) return <div>Error: {error.message}</div>;
 *   if (!connected) return <div>Connecting...</div>;
 *
 *   return <div>Connected and listening...</div>;
 * }
 * ```
 */
export function useSSE<TEventDefinitions extends EventDefinitions>(
  url: string,
  definitions: TEventDefinitions,
  options?: UseSSEOptions<TEventDefinitions>
): UseSSEReturn<TEventDefinitions> {
  const enabled = options?.enabled ?? true;
  const clientRef = useRef<SSEClientTransport<TEventDefinitions> | null>(null);
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

    const client = new SSEClientTransport(url, {
      definitions,
      validate: options?.validate,
      reconnect: options?.reconnect,
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
  }, [url, definitions, enabled, options?.validate, options?.reconnect]);

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

  // Register pending handlers when client becomes available (re-run when connection state changes)
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
    error,
    connect,
    disconnect,
  };
}

/**
 * React hook for subscribing to a specific SSE event
 *
 * @example
 * ```tsx
 * import { z } from "zod";
 * import { useSSEEvent } from "@zap-studio/realtime/client/react/sse";
 *
 * const MessageSchema = z.object({ title: z.string(), body: z.string() });
 *
 * function MessageComponent() {
 *   const { data, connected } = useSSEEvent("/api/events", "message", { message: MessageSchema });
 *
 *   if (!data) return <div>Waiting for messages...</div>;
 *
 *   return (
 *     <div>
 *       <h1>{data.title}</h1>
 *       <p>{data.body}</p>
 *     </div>
 *   );
 * }
 * ```
 */
export function useSSEEvent<
  TEventDefinitions extends EventDefinitions,
  TEvent extends EventKeys<TEventDefinitions>,
>(
  url: string,
  event: TEvent,
  schemas: TEventDefinitions,
  options?: UseSSEOptions<TEventDefinitions>
): {
  data: InferEventTypes<TEventDefinitions>[TEvent] | null;
  connected: boolean;
  error: Error | null;
} {
  const [data, setData] = useState<
    InferEventTypes<TEventDefinitions>[TEvent] | null
  >(null);
  const { on, connected, error } = useSSE(url, schemas, options);

  useEffect(() => {
    const unsubscribe = on(event, (eventData) => {
      setData(eventData);
    });
    return unsubscribe;
  }, [on, event]);

  return { data, connected, error };
}

/**
 * React hook for collecting SSE events into an array
 *
 * @example
 * ```tsx
 * import { z } from "zod";
 * import { useSSEEventHistory } from "@zap-studio/realtime/client/react/sse";
 *
 * const MessageSchema = z.object({ title: z.string(), body: z.string() });
 *
 * function MessageListComponent() {
 *   const { events, connected, clear } = useSSEEventHistory("/api/events", "message", { message: MessageSchema }, {
 *     maxEvents: 100,
 *   });
 *
 *   return (
 *     <div>
 *       <button onClick={clear}>Clear</button>
 *       {events.map((msg, i) => (
 *         <div key={i}>
 *           <h1>{msg.title}</h1>
 *           <p>{msg.body}</p>
 *         </div>
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */
export function useSSEEventHistory<
  TEventDefinitions extends EventDefinitions,
  TEvent extends EventKeys<TEventDefinitions>,
>(
  url: string,
  event: TEvent,
  schemas: TEventDefinitions,
  options?: UseSSEOptions<TEventDefinitions> & {
    /**
     * Maximum number of events to keep
     * @default 100
     */
    maxEvents?: number;
  }
): {
  events: InferEventTypes<TEventDefinitions>[TEvent][];
  connected: boolean;
  error: Error | null;
  clear: () => void;
} {
  const maxEvents = options?.maxEvents ?? 100;
  const [events, setEvents] = useState<
    InferEventTypes<TEventDefinitions>[TEvent][]
  >([]);
  const { on, connected, error } = useSSE(url, schemas, options);

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

  const clear = useCallback(() => {
    setEvents([]);
  }, []);

  return { events, connected, error, clear };
}
