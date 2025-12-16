import type {
  ClientTransportOptions,
  EventDefinitions,
  EventKeys,
  EventMessage,
  InferEventTypes,
  WSProtocolMessage,
} from "../../types";
import { BaseClientTransport } from "../base/client";

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
 * Bidirectional client transport interface
 *
 * Extends the base client transport with send capabilities
 */
export interface BidirectionalClientTransport<
  TEventDefinitions extends EventDefinitions,
> {
  /**
   * Send an event to the server
   */
  send<TEvent extends EventKeys<TEventDefinitions>>(
    event: TEvent,
    data: InferEventTypes<TEventDefinitions>[TEvent]
  ): void;

  /**
   * Subscribe to a channel
   */
  subscribe(channel: string): void;
}

/**
 * WebSocket Client Transport
 *
 * Handles WebSocket connections for real-time events with automatic
 * reconnection, validation, and bidirectional communication.
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
  extends BaseClientTransport<TEventDefinitions>
  implements BidirectionalClientTransport<TEventDefinitions>
{
  private readonly protocols?: string | string[];
  private ws: WebSocket | null = null;
  private intentionalClose = false;

  constructor(
    url: string,
    options: WSClientTransportOptions<TEventDefinitions>
  ) {
    super(url, options);
    this.protocols = options.protocols;
  }

  /**
   * Connect to the WebSocket server
   */
  connect(): void {
    if (this.ws && this.ws.readyState !== WebSocket.CLOSED) {
      return;
    }

    this.intentionalClose = false;
    this.createWebSocket();
  }

  /**
   * Disconnect from the WebSocket server
   */
  disconnect(): void {
    this.intentionalClose = true;
    super.disconnect();
  }

  /**
   * Close the underlying WebSocket connection
   */
  protected closeConnection(): void {
    if (this.ws) {
      this.ws.close(1000, "Client disconnect");
      this.ws = null;
    }
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
      this.onConnectionEstablished();
    };

    this.ws.onclose = (event) => {
      this.onConnectionLost();
      this.ws = null;

      if (!this.intentionalClose && event.code !== 1000) {
        this.handleReconnect(() => this.createWebSocket());
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
        const data = await this.validateEventData(event, eventMessage.data);
        this.dispatchEvent(event, data);
      }
    } catch (error) {
      this.notifyError(
        error instanceof Error ? error : new Error(String(error))
      );
    }
  }
}
