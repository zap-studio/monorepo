import type {
  EventDefinitions,
  EventKeys,
  EventMessage,
  InferEventTypes,
  ServerTransport,
  ServerWebSocketTransportOptions,
} from "../../types";

/**
 * WebSocket server transport options
 */
export type WSServerTransportOptions = ServerWebSocketTransportOptions & {
  /** Ping interval in milliseconds for keep-alive */
  pingInterval?: number;
  /** Pong timeout in milliseconds */
  pongTimeout?: number;
};

/**
 * WebSocket message types for protocol
 */
export type WSMessageType = "event" | "ping" | "pong" | "subscribe" | "error";

/**
 * WebSocket protocol message structure
 */
export type WSProtocolMessage<
  TEventDefinitions extends EventDefinitions = EventDefinitions,
> = {
  type: WSMessageType;
  payload?:
    | EventMessage<TEventDefinitions>
    | { channel?: string }
    | { message: string };
  timestamp: number;
};

/**
 * WebSocket connection handler type
 */
export type WSConnectionHandler<TEventDefinitions extends EventDefinitions> = {
  /** Send an event to this connection */
  send<TEvent extends EventKeys<TEventDefinitions>>(
    event: TEvent,
    data: InferEventTypes<TEventDefinitions>[TEvent]
  ): void;
  /** Send raw message */
  sendRaw(message: WSProtocolMessage<TEventDefinitions>): void;
  /** Close the connection */
  close(code?: number, reason?: string): void;
  /** Check if connection is open */
  readonly isOpen: boolean;
  /** Connection ID */
  readonly id: string;
  /** Subscribed channels */
  readonly channels: Set<string>;
};

/**
 * Format an event as a WebSocket protocol message
 */
export function formatWSMessage<TEventDefinitions extends EventDefinitions>(
  message: EventMessage<TEventDefinitions>
): WSProtocolMessage<TEventDefinitions> {
  return {
    type: "event",
    payload: message,
    timestamp: Date.now(),
  };
}

/**
 * Format a ping message
 */
export function formatPingMessage(): WSProtocolMessage {
  return {
    type: "ping",
    timestamp: Date.now(),
  };
}

/**
 * Format a pong message
 */
export function formatPongMessage(): WSProtocolMessage {
  return {
    type: "pong",
    timestamp: Date.now(),
  };
}

/**
 * Format an error message
 */
export function formatErrorMessage(message: string): WSProtocolMessage {
  return {
    type: "error",
    payload: { message },
    timestamp: Date.now(),
  };
}

/**
 * Parse a WebSocket message
 */
export function parseWSMessage<TEventDefinitions extends EventDefinitions>(
  data: string
): WSProtocolMessage<TEventDefinitions> {
  return JSON.parse(data) as WSProtocolMessage<TEventDefinitions>;
}

/**
 * Generate a unique connection ID
 */
function generateConnectionId(): string {
  return `ws-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 11)}`;
}

/**
 * WebSocket Server Transport
 *
 * This class handles WebSocket connections for real-time events.
 * It provides bidirectional communication and supports channels.
 *
 * @example
 * ```ts
 * import { WSServerTransport } from "@zap-studio/realtime/transport/ws/server";
 *
 * const transport = new WSServerTransport({
 *   pingInterval: 30000,
 * });
 *
 * // Handle WebSocket upgrade
 * const handler = transport.handleUpgrade(events, {
 *   onConnection: (conn) => {
 *     console.log("Client connected:", conn.id);
 *   },
 *   onMessage: (conn, event, data) => {
 *     // Handle client messages
 *   },
 *   onClose: (conn) => {
 *     console.log("Client disconnected:", conn.id);
 *   },
 * });
 * ```
 */
export class WSServerTransport<TEventDefinitions extends EventDefinitions>
  implements ServerTransport<TEventDefinitions>
{
  private readonly pingInterval: number;
  private readonly pongTimeout: number;

  constructor(options?: WSServerTransportOptions) {
    this.pingInterval = options?.pingInterval ?? 30_000;
    this.pongTimeout = options?.pongTimeout ?? 10_000;
  }

  /**
   * Create a WebSocket connection handler
   *
   * This creates a handler that wraps a WebSocket and provides
   * type-safe event sending and channel management.
   */
  createConnectionHandler(
    ws: WebSocket,
    options?: {
      onClose?: () => void;
      onError?: (error: Error) => void;
    }
  ): WSConnectionHandler<TEventDefinitions> {
    const id = generateConnectionId();
    const channels = new Set<string>();
    let pingTimer: ReturnType<typeof setInterval> | null = null;
    let pongTimer: ReturnType<typeof setTimeout> | null = null;

    const cleanup = () => {
      if (pingTimer) {
        clearInterval(pingTimer);
        pingTimer = null;
      }
      if (pongTimer) {
        clearTimeout(pongTimer);
        pongTimer = null;
      }
    };

    const sendRaw = (message: WSProtocolMessage<TEventDefinitions>) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(message));
      }
    };

    // Start ping/pong keep-alive
    if (this.pingInterval > 0) {
      pingTimer = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          const pingMsg: WSProtocolMessage<TEventDefinitions> = {
            type: "ping",
            timestamp: Date.now(),
          };
          sendRaw(pingMsg);

          // Set pong timeout
          pongTimer = setTimeout(() => {
            // No pong received, close connection
            ws.close(1000, "Pong timeout");
          }, this.pongTimeout);
        }
      }, this.pingInterval);
    }

    // Handle incoming messages for ping/pong
    const originalOnMessage = ws.onmessage;
    ws.onmessage = (event) => {
      try {
        const message = parseWSMessage<TEventDefinitions>(event.data as string);

        if (message.type === "pong") {
          // Clear pong timeout
          if (pongTimer) {
            clearTimeout(pongTimer);
            pongTimer = null;
          }
          return;
        }

        if (message.type === "ping") {
          // Respond with pong
          const pongMsg: WSProtocolMessage<TEventDefinitions> = {
            type: "pong",
            timestamp: Date.now(),
          };
          sendRaw(pongMsg);
          return;
        }

        if (message.type === "subscribe" && message.payload) {
          const payload = message.payload as { channel?: string };
          if (payload.channel) {
            channels.add(payload.channel);
          }
          return;
        }
      } catch {
        // Not a protocol message, pass through
      }

      // Call original handler if exists
      if (originalOnMessage) {
        originalOnMessage.call(ws, event);
      }
    };

    ws.onclose = () => {
      cleanup();
      options?.onClose?.();
    };

    ws.onerror = (event) => {
      cleanup();
      options?.onError?.(new Error(`WebSocket error: ${event.type}`));
    };

    return {
      send<TEvent extends EventKeys<TEventDefinitions>>(
        event: TEvent,
        data: InferEventTypes<TEventDefinitions>[TEvent]
      ) {
        const message: EventMessage<TEventDefinitions> = {
          id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`,
          event,
          data,
          timestamp: Date.now(),
        };
        sendRaw(formatWSMessage(message));
      },
      sendRaw,
      close(code?: number, reason?: string) {
        cleanup();
        ws.close(code, reason);
      },
      get isOpen() {
        return ws.readyState === WebSocket.OPEN;
      },
      id,
      channels,
    };
  }

  /**
   * Get ping interval
   */
  getPingInterval(): number {
    return this.pingInterval;
  }

  /**
   * Get pong timeout
   */
  getPongTimeout(): number {
    return this.pongTimeout;
  }
}

/**
 * WebSocket connection manager for handling multiple connections
 */
export class WSConnectionManager<TEventDefinitions extends EventDefinitions> {
  private readonly connections = new Map<
    string,
    WSConnectionHandler<TEventDefinitions>
  >();
  private readonly channelSubscriptions = new Map<
    string,
    Set<WSConnectionHandler<TEventDefinitions>>
  >();

  /**
   * Add a connection
   */
  add(handler: WSConnectionHandler<TEventDefinitions>): void {
    this.connections.set(handler.id, handler);
  }

  /**
   * Remove a connection
   */
  remove(id: string): void {
    const handler = this.connections.get(id);
    if (handler) {
      // Remove from all channels
      for (const channel of handler.channels) {
        const subs = this.channelSubscriptions.get(channel);
        if (subs) {
          subs.delete(handler);
          if (subs.size === 0) {
            this.channelSubscriptions.delete(channel);
          }
        }
      }
      this.connections.delete(id);
    }
  }

  /**
   * Subscribe a connection to a channel
   */
  subscribe(id: string, channel: string): void {
    const handler = this.connections.get(id);
    if (handler) {
      handler.channels.add(channel);
      let subs = this.channelSubscriptions.get(channel);
      if (!subs) {
        subs = new Set();
        this.channelSubscriptions.set(channel, subs);
      }
      subs.add(handler);
    }
  }

  /**
   * Unsubscribe a connection from a channel
   */
  unsubscribe(id: string, channel: string): void {
    const handler = this.connections.get(id);
    if (handler) {
      handler.channels.delete(channel);
      const subs = this.channelSubscriptions.get(channel);
      if (subs) {
        subs.delete(handler);
        if (subs.size === 0) {
          this.channelSubscriptions.delete(channel);
        }
      }
    }
  }

  /**
   * Broadcast an event to all connections
   */
  broadcast<TEvent extends EventKeys<TEventDefinitions>>(
    event: TEvent,
    data: InferEventTypes<TEventDefinitions>[TEvent]
  ): void {
    for (const handler of this.connections.values()) {
      if (handler.isOpen) {
        handler.send(event, data);
      }
    }
  }

  /**
   * Broadcast an event to a specific channel
   */
  broadcastToChannel<TEvent extends EventKeys<TEventDefinitions>>(
    channel: string,
    event: TEvent,
    data: InferEventTypes<TEventDefinitions>[TEvent]
  ): void {
    const subs = this.channelSubscriptions.get(channel);
    if (subs) {
      for (const handler of subs) {
        if (handler.isOpen) {
          handler.send(event, data);
        }
      }
    }
  }

  /**
   * Send an event to a specific connection
   */
  sendTo<TEvent extends EventKeys<TEventDefinitions>>(
    id: string,
    event: TEvent,
    data: InferEventTypes<TEventDefinitions>[TEvent]
  ): boolean {
    const handler = this.connections.get(id);
    if (handler?.isOpen) {
      handler.send(event, data);
      return true;
    }
    return false;
  }

  /**
   * Get a connection by ID
   */
  get(id: string): WSConnectionHandler<TEventDefinitions> | undefined {
    return this.connections.get(id);
  }

  /**
   * Get all connection IDs
   */
  getConnectionIds(): string[] {
    return Array.from(this.connections.keys());
  }

  /**
   * Get connection count
   */
  get size(): number {
    return this.connections.size;
  }

  /**
   * Close all connections
   */
  closeAll(code?: number, reason?: string): void {
    for (const handler of this.connections.values()) {
      handler.close(code, reason);
    }
    this.connections.clear();
    this.channelSubscriptions.clear();
  }
}
