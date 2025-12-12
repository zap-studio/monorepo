import type { StandardSchemaV1 } from "@standard-schema/spec";

/**
 * A record of event names to their Standard Schema validators
 */
export type EventSchemaMap = Record<string, StandardSchemaV1>;

/**
 * Infer the output types from a schema map
 */
export type InferEventTypes<TSchemas extends EventSchemaMap> = {
  [K in keyof TSchemas]: StandardSchemaV1.InferOutput<TSchemas[K]>;
};

/**
 * Event message structure sent over transports
 */
export type EventMessage<
  TSchemas extends EventSchemaMap = EventSchemaMap,
  TEvent extends keyof TSchemas = keyof TSchemas,
> = {
  /** Unique event ID */
  id: string;
  /** Event name */
  event: TEvent;
  /** Event payload data */
  data: InferEventTypes<TSchemas>[TEvent];
  /** Timestamp when event was created */
  timestamp: number;
  /** Optional retry interval in milliseconds for SSE */
  retry?: number;
};

/**
 * Raw event message before validation
 */
export type RawEventMessage = {
  id: string;
  event: string;
  data: unknown;
  timestamp: number;
  retry?: number;
};

/**
 * Subscription options
 */
export type SubscribeOptions = {
  /** Optional channel/topic to subscribe to */
  channel?: string;
  /** Optional filter function */
  filter?: (event: RawEventMessage) => boolean;
  /** AbortSignal to cancel the subscription */
  signal?: AbortSignal;
};

/**
 * Publish options
 */
export type PublishOptions = {
  /** Optional channel/topic to publish to */
  channel?: string;
  /** Optional retry interval hint for SSE clients */
  retry?: number;
};

/**
 * Server-side emitter interface for pub/sub
 */
export type ServerEmitter<TSchemas extends EventSchemaMap> = {
  /**
   * Subscribe to events, returns an async iterator
   */
  subscribe(
    options?: SubscribeOptions
  ): AsyncGenerator<EventMessage<TSchemas>, void, unknown>;

  /**
   * Publish an event
   */
  publish<TEvent extends keyof TSchemas & string>(
    event: TEvent,
    data: InferEventTypes<TSchemas>[TEvent],
    options?: PublishOptions
  ): Promise<void>;

  /**
   * Close the emitter and cleanup resources
   */
  close(): void;
};

/**
 * Server transport interface, it handles streaming events to clients
 */
export type ServerTransport<TSchemas extends EventSchemaMap> = {
  /**
   * Create a streaming response from a subscription
   */
  createResponse(
    subscription: AsyncGenerator<EventMessage<TSchemas>, void, unknown>,
    options?: ServerTransportOptions
  ): Response;
};

/**
 * Server transport configuration options
 */
export type ServerTransportOptions = {
  /** Heartbeat interval in milliseconds (0 to disable) */
  heartbeatInterval?: number;
  /** Custom headers to add to the response */
  headers?: Record<string, string>;
  /** AbortSignal to cancel the stream */
  signal?: AbortSignal;
};

/**
 * Client transport interface, it handles receiving events from server
 */
export type ClientTransport<TSchemas extends EventSchemaMap> = {
  /**
   * Connect to the event stream
   */
  connect(): void;

  /**
   * Disconnect from the event stream
   */
  disconnect(): void;

  /**
   * Register an event handler
   */
  on<TEvent extends keyof TSchemas & string>(
    event: TEvent,
    handler: (data: InferEventTypes<TSchemas>[TEvent]) => void
  ): () => void;

  /**
   * Register handler for all events
   */
  onAny(
    handler: <TEvent extends keyof TSchemas & string>(
      event: TEvent,
      data: InferEventTypes<TSchemas>[TEvent]
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
};

/**
 * Client transport options
 */
export type ClientTransportOptions<TSchemas extends EventSchemaMap> = {
  /** Event schemas for validation */
  schemas: TSchemas;
  /**
   * Whether to validate incoming events
   * @default true
   */
  validate?: boolean;
  /** Reconnection options */
  reconnect?: {
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
  };
};

/**
 * Events API interface returned by createEvents
 */
export type EventsAPI<TSchemas extends EventSchemaMap> = {
  /** The event schemas */
  schemas: TSchemas;

  /**
   * Validate event data against schema
   */
  validate<TEvent extends keyof TSchemas & string>(
    event: TEvent,
    data: unknown
  ): Promise<InferEventTypes<TSchemas>[TEvent]>;
};

/**
 * Plugin definition type
 */
export type RealtimePlugin<TSchemas extends EventSchemaMap> = {
  /** Plugin name */
  name: string;
  /** Event schemas provided by this plugin */
  schemas: TSchemas;
  /** Optional helper functions */
  helpers?: Record<string, (...args: unknown[]) => unknown>;
};
