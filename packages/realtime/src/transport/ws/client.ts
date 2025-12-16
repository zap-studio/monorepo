import { validateSchema } from "../../schema";
import type {
  ClientTransport,
  ClientTransportOptions,
  EventDefinitions,
  EventKeys,
  EventMessage,
  InferEventTypes,
} from "../../types";
import type { WSProtocolMessage } from "./server";

/**
 * WebSocket client transport options
 */
export type WSClientTransportOptions<
  TEventDefinitions extends EventDefinitions,
> = ClientTransportOptions<TEventDefinitions> & {
  /** Custom protocols for WebSocket connection */
  protocols?: string | string[];
};

/**
 * Handler function for a specific event type
 */
type EventHandler<
  TEventDefinitions extends EventDefinitions,
  TEvent extends EventKeys<TEventDefinitions> = EventKeys<TEventDefinitions>,
> = (data: InferEventTypes<TEventDefinitions>[TEvent]) => void;

/**
 * Generic handler function for any event type
 */
type AnyEventHandler<TEventDefinitions extends EventDefinitions> = <
  TEvent extends EventKeys<TEventDefinitions> = EventKeys<TEventDefinitions>,
>(
  event: TEvent,
  data: InferEventTypes<TEventDefinitions>[TEvent]
) => void;

/**
 * WebSocket Client Transport
 *
 * This class handles WebSocket connections for real-time events with
 * automatic reconnection, validation, and bidirectional communication.
 *
 * @example
 * ```ts
 * import { WSClientTransport } from "@zap-studio/realtime/transport/ws/client";
 * import { z } from "zod";
 *
 * const definitions = {
 *   message: z.object({ content: z.string() }),
 *   notification: z.object({ title: z.string() }),
 * };
 *
 * const client = new WSClientTransport("wss://example.com/ws", {
 *   definitions,
 * });
 *
 * // Register event handlers
 * client.on("message", (data) => {
 *   console.log("Message:", data.content);
 * });
 *
 * client.connect();
 *
 * // Send messages to server
 * client.send("message", { content: "Hello!" });
 * ```
 */
export class WSClientTransport<TEventDefinitions extends EventDefinitions>
  implements ClientTransport<TEventDefinitions>
{
  private readonly url: string;
  private readonly definitions: TEventDefinitions;
  private readonly validate: boolean;
  private readonly protocols?: string | string[];

  private readonly reconnectEnabled: boolean;
  private readonly reconnectMaxAttempts: number;
  private readonly reconnectDelay: number;
  private readonly reconnectMaxDelay: number;
  private readonly reconnectMultiplier: number;

  private ws: WebSocket | null = null;

  private readonly eventHandlers = new Map<
    EventKeys<TEventDefinitions>,
    Set<EventHandler<TEventDefinitions>>
  >();
  private readonly anyHandlers = new Set<AnyEventHandler<TEventDefinitions>>();
  private readonly errorHandlers = new Set<(error: Error) => void>();
  private readonly connectionHandlers = new Set<(connected: boolean) => void>();

  private isConnected = false;
  private reconnectAttempts = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private intentionalClose = false;

  constructor(
    url: string,
    options: WSClientTransportOptions<TEventDefinitions>
  ) {
    this.url = url;
    this.definitions = options.definitions;
    this.validate = options.validate ?? true;
    this.protocols = options.protocols;

    const reconnect = options.reconnect ?? {};
    this.reconnectEnabled = reconnect.enabled ?? true;
    this.reconnectMaxAttempts =
      reconnect.maxAttempts ?? Number.POSITIVE_INFINITY;
    this.reconnectDelay = reconnect.delay ?? 1000;
    this.reconnectMaxDelay = reconnect.maxDelay ?? 30_000;
    this.reconnectMultiplier = reconnect.multiplier ?? 2;
  }

  /**
   * Returns the current connection status.
   */
  get connected(): boolean {
    return this.isConnected;
  }

  /**
   * Connects to the WebSocket server.
   */
  connect(): void {
    if (this.ws && this.ws.readyState !== WebSocket.CLOSED) {
      return;
    }

    this.intentionalClose = false;
    this.createWebSocket();
  }

  /**
   * Disconnects from the WebSocket server.
   */
  disconnect(): void {
    this.intentionalClose = true;
    this.clearReconnectTimer();
    this.reconnectAttempts = 0;

    if (this.ws) {
      this.ws.close(1000, "Client disconnect");
      this.ws = null;
    }

    if (this.isConnected) {
      this.isConnected = false;
      this.notifyConnectionChange(false);
    }
  }

  /**
   * Registers an event listener for the specified event.
   */
  on<TEvent extends EventKeys<TEventDefinitions>>(
    event: TEvent,
    handler: (data: InferEventTypes<TEventDefinitions>[TEvent]) => void
  ): () => void {
    let handlers = this.eventHandlers.get(event);

    if (!handlers) {
      handlers = new Set();
      this.eventHandlers.set(event, handlers);
    }

    handlers.add(handler);

    return () => {
      handlers?.delete(handler);
      if (handlers?.size === 0) {
        this.eventHandlers.delete(event);
      }
    };
  }

  /**
   * Registers an event listener for any event.
   */
  onAny(
    handler: <TEvent extends EventKeys<TEventDefinitions>>(
      event: TEvent,
      data: InferEventTypes<TEventDefinitions>[TEvent]
    ) => void
  ): () => void {
    this.anyHandlers.add(handler);
    return () => this.anyHandlers.delete(handler);
  }

  /**
   * Registers an error listener.
   */
  onError(handler: (error: Error) => void): () => void {
    this.errorHandlers.add(handler);
    return () => this.errorHandlers.delete(handler);
  }

  /**
   * Registers a connection change listener.
   */
  onConnectionChange(handler: (connected: boolean) => void): () => void {
    this.connectionHandlers.add(handler);
    return () => this.connectionHandlers.delete(handler);
  }

  /**
   * Send a message to the server
   *
   * This is a WebSocket-specific feature for bidirectional communication.
   */
  send<TEvent extends EventKeys<TEventDefinitions>>(
    event: TEvent,
    data: InferEventTypes<TEventDefinitions>[TEvent]
  ): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      this.notifyError(new Error("WebSocket is not connected"));
      return;
    }

    const message: WSProtocolMessage<TEventDefinitions> = {
      type: "event",
      payload: {
        id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`,
        event,
        data,
        timestamp: Date.now(),
      },
      timestamp: Date.now(),
    };

    this.ws.send(JSON.stringify(message));
  }

  /**
   * Subscribe to a channel
   */
  subscribe(channel: string): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      this.notifyError(new Error("WebSocket is not connected"));
      return;
    }

    const message: WSProtocolMessage = {
      type: "subscribe",
      payload: { channel },
      timestamp: Date.now(),
    };

    this.ws.send(JSON.stringify(message));
  }

  private createWebSocket(): void {
    this.ws = new WebSocket(this.url, this.protocols);

    this.ws.onopen = () => {
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.notifyConnectionChange(true);
    };

    this.ws.onclose = (event) => {
      const wasConnected = this.isConnected;
      this.isConnected = false;
      this.ws = null;

      if (wasConnected) {
        this.notifyConnectionChange(false);
      }

      if (!this.intentionalClose && event.code !== 1000) {
        this.handleReconnect();
      }
    };

    this.ws.onerror = () => {
      this.notifyError(new Error("WebSocket connection error"));
    };

    this.ws.onmessage = (event) => {
      this.handleMessage(event.data as string);
    };
  }

  private async handleMessage(rawData: string): Promise<void> {
    try {
      const message: WSProtocolMessage<TEventDefinitions> = JSON.parse(rawData);

      // Handle ping/pong
      if (message.type === "ping") {
        const pongMessage: WSProtocolMessage = {
          type: "pong",
          timestamp: Date.now(),
        };
        this.ws?.send(JSON.stringify(pongMessage));
        return;
      }

      if (message.type === "pong") {
        // Pong received, connection is alive
        return;
      }

      if (message.type === "error") {
        const payload = message.payload as { message: string } | undefined;
        this.notifyError(new Error(payload?.message ?? "Server error"));
        return;
      }

      if (message.type === "event" && message.payload) {
        const eventMessage = message.payload as EventMessage<TEventDefinitions>;

        const event = eventMessage.event;
        let data = eventMessage.data;

        // Validate if enabled
        if (this.validate) {
          const schema = this.definitions[event];
          if (schema) {
            data = await validateSchema(schema, data);
          }
        }

        this.dispatchEvent(event, data);
      }
    } catch (error) {
      this.notifyError(
        error instanceof Error ? error : new Error(String(error))
      );
    }
  }

  private dispatchEvent<TEvent extends EventKeys<TEventDefinitions>>(
    event: TEvent,
    data: InferEventTypes<TEventDefinitions>[TEvent]
  ): void {
    const handlers = this.eventHandlers.get(event);

    if (handlers) {
      for (const handler of handlers) {
        this.safeCall(() => handler(data));
      }
    }

    for (const handler of this.anyHandlers) {
      this.safeCall(() => handler(event, data));
    }
  }

  private handleReconnect(): void {
    if (
      !this.reconnectEnabled ||
      this.reconnectAttempts >= this.reconnectMaxAttempts
    ) {
      this.notifyError(
        new Error(
          `WebSocket connection closed. Max reconnect attempts (${this.reconnectMaxAttempts}) reached.`
        )
      );
      return;
    }

    const delay = Math.min(
      this.reconnectDelay * this.reconnectMultiplier ** this.reconnectAttempts,
      this.reconnectMaxDelay
    );

    this.reconnectAttempts += 1;

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.createWebSocket();
    }, delay);
  }

  private clearReconnectTimer(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  private notifyError(error: Error): void {
    for (const handler of this.errorHandlers) {
      this.safeCall(() => handler(error));
    }
  }

  private notifyConnectionChange(connected: boolean): void {
    for (const handler of this.connectionHandlers) {
      this.safeCall(() => handler(connected));
    }
  }

  private safeCall(fn: () => void): void {
    try {
      fn();
    } catch {
      // intentionally ignored
    }
  }
}
