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
export type EventMessage<
  TEventDefinitions extends EventDefinitions = EventDefinitions,
  TEvent extends EventKeys<TEventDefinitions> = EventKeys<TEventDefinitions>,
> = {
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
export type ServerEmitter<TEventDefinitions extends EventDefinitions> = {
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
};

/**
 * Server transport interface, it handles streaming events to clients
 */
export type ServerTransport<TEventDefinitions extends EventDefinitions> = {
  /**
   * Create a streaming response from a subscription
   */
  createResponse(
    subscription: AsyncGenerator<
      EventMessage<TEventDefinitions>,
      void,
      unknown
    >,
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
export type ClientTransport<TEventDefinitions extends EventDefinitions> = {
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
};

/**
 * Client transport options
 */
export type ClientTransportOptions<TEventDefinitions extends EventDefinitions> =
  {
    /** Event definitions for validation */
    definitions: TEventDefinitions;
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
 * Events API interface
 */
export type EventsAPI<TEventDefinitions extends EventDefinitions> = {
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
};

/**
 * Plugin definition type
 */
export type RealtimePlugin<TEventDefinitions extends EventDefinitions> = {
  /** Plugin name */
  name: string;
  /** Event definitions provided by this plugin */
  definitions: TEventDefinitions;
  /** Optional helper functions */
  helpers?: Record<string, (...args: unknown[]) => unknown>;
};
