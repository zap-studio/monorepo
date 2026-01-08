import type {
  EventDefinitions,
  EventKeys,
  EventMessage,
  InferEventTypes,
  WSServerTransport as IWSServerTransport,
  ServerWebSocketTransportOptions,
  WSConnectionHandler,
  WSProtocolMessage,
} from "../../types";
import { BaseServerTransport, generateId } from "../base/server";

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
 * WebSocket message type
 */
export type WSMessageType = "event" | "ping" | "pong" | "subscribe" | "error";

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
export function formatPingMessage<
  TEventDefinitions extends EventDefinitions,
>(): WSProtocolMessage<TEventDefinitions> {
  return { type: "ping", timestamp: Date.now() };
}

/**
 * Format a pong message
 */
export function formatPongMessage<
  TEventDefinitions extends EventDefinitions,
>(): WSProtocolMessage<TEventDefinitions> {
  return { type: "pong", timestamp: Date.now() };
}

/**
 * Format an error message
 */
export function formatErrorMessage<TEventDefinitions extends EventDefinitions>(
  message: string
): WSProtocolMessage<TEventDefinitions> {
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
 * WebSocket Server Transport
 *
 * Handles WebSocket connections for real-time events.
 * Provides bidirectional communication and supports channels.
 *
 * @example
 * ```ts
 * import { WSServerTransport } from "@zap-studio/realtime/transport/ws/server";
 *
 * const transport = new WSServerTransport({
 *   pingInterval: 30000,
 * });
 *
 * // Handle WebSocket connection
 * const handler = transport.createConnectionHandler(ws, {
 *   onClose: () => console.log("Client disconnected"),
 * });
 *
 * // Send events
 * handler.send("notification", { title: "Hello!" });
 * ```
 */
export class WSServerTransport<TEventDefinitions extends EventDefinitions>
  extends BaseServerTransport<TEventDefinitions>
  implements IWSServerTransport<TEventDefinitions>
{
  private readonly pongTimeout: number;

  constructor(options?: WSServerTransportOptions) {
    super({ keepAliveInterval: options?.pingInterval });
    this.pongTimeout = options?.pongTimeout ?? 10_000;
  }

  /**
   * Create a WebSocket connection handler
   *
   * Creates a handler that wraps a WebSocket and provides
   * type-safe event sending and channel management.
   */
  createConnectionHandler(
    ws: WebSocket,
    options?: {
      onClose?: () => void;
      onError?: (error: Error) => void;
    }
  ): WSConnectionHandler<TEventDefinitions> {
    const id = `ws-${generateId()}`;
    const channels = new Set<string>();

    const sendRaw = (message: WSProtocolMessage<TEventDefinitions>) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(message));
      }
    };

    const keepAlive = this.setupKeepAlive(ws, sendRaw);

    const originalOnMessage = ws.onmessage;

    ws.onmessage = (event) => {
      const handled = this.handleProtocolMessage(
        event,
        channels,
        sendRaw,
        keepAlive
      );

      if (!handled && originalOnMessage) {
        originalOnMessage.call(ws, event);
      }
    };

    ws.onclose = () => {
      keepAlive.cleanup();
      options?.onClose?.();
    };

    ws.onerror = (event) => {
      keepAlive.cleanup();
      options?.onError?.(new Error(`WebSocket error: ${event.type}`));
    };

    return {
      id,
      channels,

      send<TEvent extends EventKeys<TEventDefinitions>>(
        event: TEvent,
        data: InferEventTypes<TEventDefinitions>[TEvent]
      ) {
        sendRaw(
          formatWSMessage({
            id: generateId(),
            event,
            data,
            timestamp: Date.now(),
          })
        );
      },
      sendRaw,
      close(code?: number, reason?: string) {
        keepAlive.cleanup();
        ws.close(code, reason);
      },
      get isOpen() {
        return ws.readyState === WebSocket.OPEN;
      },
    };
  }

  /**
   * Get ping interval
   */
  getPingInterval(): number {
    return this.keepAliveInterval;
  }

  /**
   * Get pong timeout
   */
  getPongTimeout(): number {
    return this.pongTimeout;
  }

  private setupKeepAlive(
    ws: WebSocket,
    sendRaw: (msg: WSProtocolMessage<TEventDefinitions>) => void
  ) {
    let pingTimer: ReturnType<typeof setInterval> | null = null;
    let pongTimer: ReturnType<typeof setTimeout> | null = null;

    const clearPongTimeout = () => {
      if (pongTimer) {
        clearTimeout(pongTimer);
        pongTimer = null;
      }
    };

    const cleanup = () => {
      if (pingTimer) {
        clearInterval(pingTimer);
        pingTimer = null;
      }
      clearPongTimeout();
    };

    if (this.keepAliveInterval > 0) {
      pingTimer = setInterval(() => {
        if (ws.readyState !== WebSocket.OPEN) {
          return;
        }

        sendRaw(formatPingMessage());

        pongTimer = setTimeout(() => {
          ws.close(1000, "Pong timeout");
        }, this.pongTimeout);
      }, this.keepAliveInterval);
    }

    return {
      cleanup,
      onPong: clearPongTimeout,
    };
  }

  private handleProtocolMessage(
    event: MessageEvent,
    channels: Set<string>,
    sendRaw: (msg: WSProtocolMessage<TEventDefinitions>) => void,
    keepAlive: { onPong: () => void }
  ): boolean {
    try {
      const message = parseWSMessage<TEventDefinitions>(event.data as string);

      switch (message.type) {
        case "pong":
          keepAlive.onPong();
          return true;

        case "ping":
          sendRaw(formatPongMessage());
          return true;

        case "subscribe": {
          const payload = message.payload as { channel?: string };
          if (payload?.channel) {
            channels.add(payload.channel);
          }
          return true;
        }

        default:
          return false;
      }
    } catch {
      return false;
    }
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
    if (!handler) {
      return;
    }

    for (const channel of handler.channels) {
      const subs = this.channelSubscriptions.get(channel);
      subs?.delete(handler);
      if (subs?.size === 0) {
        this.channelSubscriptions.delete(channel);
      }
    }

    this.connections.delete(id);
  }

  /**
   * Subscribe a connection to a channel
   */
  subscribe(id: string, channel: string): void {
    const handler = this.connections.get(id);
    if (!handler) {
      return;
    }

    handler.channels.add(channel);

    let subs = this.channelSubscriptions.get(channel);
    if (!subs) {
      subs = new Set();
      this.channelSubscriptions.set(channel, subs);
    }
    subs.add(handler);
  }

  /**
   * Unsubscribe a connection from a channel
   */
  unsubscribe(id: string, channel: string): void {
    const handler = this.connections.get(id);
    if (!handler) {
      return;
    }

    handler.channels.delete(channel);

    const subs = this.channelSubscriptions.get(channel);
    subs?.delete(handler);
    if (subs?.size === 0) {
      this.channelSubscriptions.delete(channel);
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
    if (!subs) {
      return;
    }

    for (const handler of subs) {
      if (handler.isOpen) {
        handler.send(event, data);
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
    if (!handler?.isOpen) {
      return false;
    }

    handler.send(event, data);
    return true;
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
