import type { StandardSchemaV1 } from "@standard-schema/spec";

/**
 * A record of event names to their Standard Schema validators
 */
export type EventDefinitions = {
  [key in string]: StandardSchemaV1;
};

/**
 * Extract only string keys from an EventDefinitions type
 */
export type EventKeys<TEventDefinitions extends EventDefinitions> = Extract<
  keyof TEventDefinitions,
  string
>;

/**
 * Infer the output types from a schema map
 */
export type InferEventTypes<TEventDefinitions extends EventDefinitions> = {
  [K in EventKeys<TEventDefinitions>]: StandardSchemaV1.InferOutput<
    TEventDefinitions[K]
  >;
};

/**
 * Event message structure sent over transports
 */
export interface EventMessage<
  TEventDefinitions extends EventDefinitions = EventDefinitions,
  TEvent extends EventKeys<TEventDefinitions> = EventKeys<TEventDefinitions>,
> {
  /** Event payload data */
  data: InferEventTypes<TEventDefinitions>[TEvent];
  /** Event name */
  event: TEvent;
  /** Unique event ID */
  id: string;
  /** Optional retry interval in milliseconds for SSE */
  retry?: number;
  /** Timestamp when event was created */
  timestamp: number;
}

/**
 * Raw event message before validation
 */
export interface RawEventMessage {
  data: unknown;
  event: string;
  id: string;
  retry?: number;
  timestamp: number;
}

/**
 * Subscription options
 */
export interface SubscribeOptions {
  /** Optional channel/topic to subscribe to */
  channel?: string;
  /** Optional filter function */
  filter?: (event: RawEventMessage) => boolean;
  /** AbortSignal to cancel the subscription */
  signal?: AbortSignal;
}

/**
 * Publish options
 */
export interface PublishOptions {
  /** Optional channel/topic to publish to */
  channel?: string;
  /** Optional retry interval hint for SSE clients */
  retry?: number;
}

/**
 * Server-side emitter interface for pub/sub
 */
export interface ServerEmitter<TEventDefinitions extends EventDefinitions> {
  /**
   * Close the emitter and cleanup resources
   */
  close(): void;

  /**
   * Publish an event
   */
  publish<TEvent extends EventKeys<TEventDefinitions>>(
    event: TEvent,
    data: InferEventTypes<TEventDefinitions>[TEvent],
    options?: PublishOptions
  ): Promise<void>;
  /**
   * Subscribe to events, returns an async iterator
   */
  subscribe(
    options?: SubscribeOptions
  ): AsyncGenerator<EventMessage<TEventDefinitions>, void, unknown>;
}

/**
 * Base client transport interface for receiving events from server.
 *
 * This is the common interface implemented by all client transports (SSE, WebSocket).
 * It provides unidirectional event reception with reconnection support.
 */
export interface ClientTransport<TEventDefinitions extends EventDefinitions> {
  /**
   * Connect to the event stream
   */
  connect(): void;

  /**
   * Check if currently connected
   */
  readonly connected: boolean;

  /**
   * Disconnect from the event stream
   */
  disconnect(): void;

  /**
   * Register an event handler for a specific event type
   */
  on<TEvent extends EventKeys<TEventDefinitions>>(
    event: TEvent,
    handler: (data: InferEventTypes<TEventDefinitions>[TEvent]) => void
  ): () => void;

  /**
   * Register handler for all events
   */
  onAny(
    handler: <TEvent extends EventKeys<TEventDefinitions>>(
      event: TEvent,
      data: InferEventTypes<TEventDefinitions>[TEvent]
    ) => void
  ): () => void;

  /**
   * Register connection state change handler
   */
  onConnectionChange(handler: (connected: boolean) => void): () => void;

  /**
   * Register error handler
   */
  onError(handler: (error: Error) => void): () => void;
}

/**
 * Bidirectional client transport interface.
 *
 * Extends the base client transport with the ability to send events
 * back to the server. Used by WebSocket transport.
 */
export type BidirectionalClientTransport<
  TEventDefinitions extends EventDefinitions,
> = ClientTransport<TEventDefinitions> & {
  /**
   * Send an event to the server
   */
  send<TEvent extends EventKeys<TEventDefinitions>>(
    event: TEvent,
    data: InferEventTypes<TEventDefinitions>[TEvent]
  ): void;

  /**
   * Subscribe to a channel for filtered events
   */
  subscribe(channel: string): void;
};

/**
 * Client transport options with reconnection configuration
 */
export interface ClientTransportOptions<
  TEventDefinitions extends EventDefinitions,
> {
  /** Event definitions for validation */
  definitions: TEventDefinitions;
  /** Reconnection options */
  reconnect?: ReconnectOptions;
  /**
   * Whether to validate incoming events
   * @default true
   */
  validate?: boolean;
}

/**
 * Reconnection options for client transports
 */
export interface ReconnectOptions {
  /**
   * Initial delay in ms before reconnecting
   * @default 1000
   */
  delay?: number;
  /**
   * Enable automatic reconnection
   * @default true
   */
  enabled?: boolean;
  /**
   * Maximum number of reconnection attempts
   * @default Infinity
   */
  maxAttempts?: number;
  /**
   * Maximum delay in ms
   * @default 30000
   */
  maxDelay?: number;
  /**
   * Delay multiplier for exponential backoff
   * @default 2
   */
  multiplier?: number;
}

/**
 * Base server transport interface.
 *
 * Common interface for all server transports. Specific transport types
 * extend this with their own methods.
 */
export interface ServerTransport {
  /**
   * Get the keep-alive interval in milliseconds
   */
  getKeepAliveInterval?(): number;
}

/**
 * SSE server transport interface.
 *
 * Handles streaming events to clients using Server-Sent Events.
 * This is a unidirectional transport (server to client only).
 */
export type SSEServerTransport<TEventDefinitions extends EventDefinitions> =
  ServerTransport & {
    /**
     * Create a streaming SSE response from an event subscription
     */
    createResponse(
      subscription: AsyncGenerator<
        EventMessage<TEventDefinitions>,
        void,
        unknown
      >,
      options?: ServerSSETransportOptions
    ): Response;
  };

/**
 * WebSocket server transport interface.
 *
 * Handles bidirectional communication with clients using WebSocket.
 * Supports channels and connection management.
 */
export type WSServerTransport<TEventDefinitions extends EventDefinitions> =
  ServerTransport & {
    /**
     * Create a connection handler for a WebSocket connection
     */
    createConnectionHandler(
      connection: WebSocket,
      options?: ServerWebSocketTransportOptions
    ): WSConnectionHandler<TEventDefinitions>;

    /**
     * Get the ping interval in milliseconds
     */
    getPingInterval(): number;

    /**
     * Get the pong timeout in milliseconds
     */
    getPongTimeout(): number;
  };

/**
 * WebSocket protocol message structure
 */
export interface WSProtocolMessage<
  TEventDefinitions extends EventDefinitions = EventDefinitions,
> {
  payload?:
    | EventMessage<TEventDefinitions>
    | { channel?: string }
    | { message: string };
  timestamp: number;
  type: "event" | "ping" | "pong" | "subscribe" | "error";
}

/**
 * WebSocket connection handler interface
 */
export interface WSConnectionHandler<
  TEventDefinitions extends EventDefinitions,
> {
  /** Subscribed channels */
  readonly channels: Set<string>;
  /** Close the connection */
  close(code?: number, reason?: string): void;
  /** Unique connection ID */
  readonly id: string;
  /** Check if connection is open */
  readonly isOpen: boolean;
  /** Send an event to this connection */
  send<TEvent extends EventKeys<TEventDefinitions>>(
    event: TEvent,
    data: InferEventTypes<TEventDefinitions>[TEvent]
  ): void;
  /** Send raw protocol message */
  sendRaw(message: WSProtocolMessage<TEventDefinitions>): void;
}

/**
 * Server SSE transport configuration options
 */
export interface ServerSSETransportOptions {
  /** Custom headers to add to the response */
  headers?: Record<string, string>;
  /** Heartbeat interval in milliseconds (0 to disable) */
  heartbeatInterval?: number;
  /** AbortSignal to cancel the stream */
  signal?: AbortSignal;
}

/**
 * Server WebSocket transport configuration options
 */
export interface ServerWebSocketTransportOptions {
  /** Callback to execute when the connection is closed */
  onClose?: () => void;
  /** Callback to execute when an error occurs */
  onError?: (error: Error) => void;
}

/**
 * Events API interface
 */
export interface EventsAPI<TEventDefinitions extends EventDefinitions> {
  /**
   * Publish an event
   */
  publish<TEvent extends EventKeys<TEventDefinitions>>(
    event: TEvent,
    data: InferEventTypes<TEventDefinitions>[TEvent],
    options?: PublishOptions
  ): Promise<void>;

  /**
   * Subscribe to events
   */
  subscribe(
    options?: SubscribeOptions
  ): AsyncGenerator<EventMessage<TEventDefinitions>, void, unknown>;
  /**
   * Validate event data against schema
   */
  validate<TEvent extends EventKeys<TEventDefinitions>>(
    event: TEvent,
    data: unknown
  ): Promise<InferEventTypes<TEventDefinitions>[TEvent]>;
}

/**
 * Extract EventDefinitions from EventsAPI type
 */
export type ExtractEventDefinitions<T> =
  T extends EventsAPI<infer TEventDefinitions> ? TEventDefinitions : never;

/**
 * Plugin definition type
 */
export interface RealtimePlugin<TEventDefinitions extends EventDefinitions> {
  /** Event definitions provided by this plugin */
  definitions: TEventDefinitions;
  /** Optional helper functions */
  helpers?: Record<string, (...args: unknown[]) => unknown>;
  /** Plugin name */
  name: string;
}
