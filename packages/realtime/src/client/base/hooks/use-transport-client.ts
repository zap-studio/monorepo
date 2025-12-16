import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import type { BaseClientTransport } from "../../../transport/base/client";
import type {
  EventDefinitions,
  EventKeys,
  InferEventTypes,
} from "../../../types";

/**
 * Base options for transport client hooks
 */
export type UseTransportClientOptions = {
  /**
   * Whether to connect on mount
   * @default true
   */
  enabled?: boolean;
  /**
   * Whether to validate incoming events against schemas
   * @default true
   */
  validate?: boolean;
  /**
   * Reconnection configuration
   */
  reconnect?: {
    enabled?: boolean;
    maxAttempts?: number;
    delay?: number;
    maxDelay?: number;
    multiplier?: number;
  };
};

/**
 * Base return type for transport client hooks
 */
export type UseTransportClientReturn<
  TEventDefinitions extends EventDefinitions,
> = {
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
 * Factory function type for creating transport clients
 */
export type TransportClientFactory<
  TEventDefinitions extends EventDefinitions,
  TClient extends BaseClientTransport<TEventDefinitions>,
  TOptions extends UseTransportClientOptions,
> = (
  url: string,
  definitions: TEventDefinitions,
  options: TOptions | undefined
) => TClient;

/**
 * Core hook for managing transport client connections
 *
 * This hook provides the shared logic for SSE and WebSocket connections:
 * - Connection state management with useSyncExternalStore
 * - Pending handler registration for handlers added before connection
 * - Error tracking
 * - Connect/disconnect controls
 *
 * @internal
 */
export function useTransportClient<
  TEventDefinitions extends EventDefinitions,
  TClient extends BaseClientTransport<TEventDefinitions>,
  TOptions extends UseTransportClientOptions,
>(
  createClient: TransportClientFactory<TEventDefinitions, TClient, TOptions>,
  url: string,
  definitions: TEventDefinitions,
  options?: TOptions
): UseTransportClientReturn<TEventDefinitions> & { client: TClient | null } {
  const enabled = options?.enabled ?? true;
  const clientRef = useRef<TClient | null>(null);
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

    const client = createClient(url, definitions, options);
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
  }, [url, definitions, enabled, options, createClient]);

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

  const connect = useCallback(() => {
    clientRef.current?.connect();
  }, []);

  const disconnect = useCallback(() => {
    clientRef.current?.disconnect();
  }, []);

  return {
    client: clientRef.current,
    connected,
    on,
    onAny,
    error,
    connect,
    disconnect,
  };
}
