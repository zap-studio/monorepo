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
  /** Unique event ID */
  id: string;
  /** Event name */
  event: TEvent;
  /** Event payload data */
  data: InferEventTypes<TEventDefinitions>[TEvent];
  /** Timestamp when event was created */
  timestamp: number;
  /** Optional retry interval in milliseconds for SSE */
  retry?: number;
}

/**
 * Raw event message before validation
 */
export interface RawEventMessage {
  id: string;
  event: string;
  data: unknown;
  timestamp: number;
  retry?: number;
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
   * Subscribe to events, returns an async iterator
   */
  subscribe(
    options?: SubscribeOptions
  ): AsyncGenerator<EventMessage<TEventDefinitions>, void, unknown>;

  /**
   * Publish an event
   */
  publish<TEvent extends EventKeys<TEventDefinitions>>(
    event: TEvent,
    data: InferEventTypes<TEventDefinitions>[TEvent],
    options?: PublishOptions
  ): Promise<void>;

  /**
   * Close the emitter and cleanup resources
   */
  close(): void;
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
   * Register error handler
   */
  onError(handler: (error: Error) => void): () => void;

  /**
   * Register connection state change handler
   */
  onConnectionChange(handler: (connected: boolean) => void): () => void;

  /**
   * Check if currently connected
   */
  readonly connected: boolean;
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
  /**
   * Whether to validate incoming events
   * @default true
   */
  validate?: boolean;
  /** Reconnection options */
  reconnect?: ReconnectOptions;
}

/**
 * Reconnection options for client transports
 */
export interface ReconnectOptions {
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
   * Initial delay in ms before reconnecting
   * @default 1000
   */
  delay?: number;
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
  type: "event" | "ping" | "pong" | "subscribe" | "error";
  payload?:
    | EventMessage<TEventDefinitions>
    | { channel?: string }
    | { message: string };
  timestamp: number;
}

/**
 * WebSocket connection handler interface
 */
export interface WSConnectionHandler<
  TEventDefinitions extends EventDefinitions,
> {
  /** Unique connection ID */
  readonly id: string;
  /** Check if connection is open */
  readonly isOpen: boolean;
  /** Subscribed channels */
  readonly channels: Set<string>;
  /** Send an event to this connection */
  send<TEvent extends EventKeys<TEventDefinitions>>(
    event: TEvent,
    data: InferEventTypes<TEventDefinitions>[TEvent]
  ): void;
  /** Send raw protocol message */
  sendRaw(message: WSProtocolMessage<TEventDefinitions>): void;
  /** Close the connection */
  close(code?: number, reason?: string): void;
}

/**
 * Server SSE transport configuration options
 */
export interface ServerSSETransportOptions {
  /** Heartbeat interval in milliseconds (0 to disable) */
  heartbeatInterval?: number;
  /** Custom headers to add to the response */
  headers?: Record<string, string>;
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
   * Validate event data against schema
   */
  validate<TEvent extends EventKeys<TEventDefinitions>>(
    event: TEvent,
    data: unknown
  ): Promise<InferEventTypes<TEventDefinitions>[TEvent]>;

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
  /** Plugin name */
  name: string;
  /** Event definitions provided by this plugin */
  definitions: TEventDefinitions;
  /** Optional helper functions */
  helpers?: Record<string, (...args: unknown[]) => unknown>;
}
