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
 *
 * @example
 *
 * const message: EventMessage = {
 *   id: uuid(),
 *   event: "user.created",
 *   data: {
 *     id: uuid(),
 *     email: "user@example.com",
 *     name: "John Doe",
 *   },
 *   timestamp: Date.now(),
 * };
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
 *
 * @example
 * const emitter = new ServerEmitter();
 *
 * // Subscribe to events
 * const subscription = emitter.subscribe({ channel: 'my-channel', filter: (event) => event.type === 'my-event', signal: abortSignal });
 *
 * // Publish an event
 * emitter.publish('my-event', { id: '123', data: 'hello' });
 *
 * // Close the emitter and cleanup resources
 * emitter.close();
 */
export type ServerEmitter<TSchemas extends EventSchemaMap> = {
  /**
   * Subscribe to events, returns an async iterator
   *
   * @example
   * emitter.subscribe({ channel: 'my-channel', filter: (event) => event.type === 'my-event', signal: abortSignal });
   */
  subscribe(
    options?: SubscribeOptions
  ): AsyncGenerator<EventMessage<TSchemas>, void, unknown>;

  /**
   * Publish an event
   *
   * @example
   * emitter.publish('my-event', { id: '123', data: 'hello' });
   */
  publish<TEvent extends keyof TSchemas & string>(
    event: TEvent,
    data: InferEventTypes<TSchemas>[TEvent],
    options?: PublishOptions
  ): Promise<void>;

  /**
   * Close the emitter and cleanup resources
   *
   * @example
   * emitter.close();
   */
  close(): Promise<void>;
};

/**
 * Server transport interface, it handles streaming events to clients
 *
 * @example
 * const transport = new ServerTransport();
 *
 * // Create a streaming response from a subscription
 * const response = await transport.createResponse(subscription);
 */
export type ServerTransport = {
  /**
   * Create a streaming response from a subscription
   *
   * @example
   * const response = await transport.createResponse(subscription, {
   *   heartbeatInterval: 30000,
   *   headers: { 'X-Custom-Header': 'value' },
   *   signal: abortSignal,
   * });
   */
  createResponse(
    subscription: AsyncGenerator<EventMessage, void, unknown>,
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
  headers?: Headers;
  /** AbortSignal to cancel the stream */
  signal?: AbortSignal;
};

/**
 * Client transport interface, it handles receiving events from server
 *
 * @example
 *
 * const transport = new ClientTransport();
 *
 * // Connect to the event stream
 * await transport.connect();
 *
 * // Register an event handler
 * transport.on('event', data => {
 *   console.log(data);
 * });
 *
 * // Disconnect from the event stream
 * await transport.disconnect();
 */
export type ClientTransport<TSchemas extends EventSchemaMap> = {
  /**
   * Connect to the event stream
   *
   * @example
   * const transport = new ClientTransport();
   *
   * // Connect to the event stream
   * await transport.connect();
   */
  connect(): Promise<void>;

  /**
   * Disconnect from the event stream
   *
   * @example
   * const transport = new ClientTransport();
   *
   * // Connect to the event stream
   * await transport.connect();
   *
   * // Disconnect from the event stream
   * await transport.disconnect();
   */
  disconnect(): Promise<void>;

  /**
   * Register an event handler
   *
   * @example
   * const transport = new ClientTransport();
   *
   * // Connect to the event stream
   * await transport.connect();
   *
   * // Register an event handler
   * transport.on('event', data => {
   *   console.log(data);
   * });
   */
  on<TEvent extends keyof TSchemas & string>(
    event: TEvent,
    handler: (data: InferEventTypes<TSchemas>[TEvent]) => void
  ): () => void;

  /**
   * Register handler for all events
   *
   * @example
   * const transport = new ClientTransport();
   *
   * // Connect to the event stream
   * await transport.connect();
   *
   * // Register an event handler for all events
   * transport.onAny((event, data) => {
   *   console.log(event, data);
   * });
   */
  onAny(
    handler: <TEvent extends keyof TSchemas & string>(
      event: TEvent,
      data: InferEventTypes<TSchemas>[TEvent]
    ) => void
  ): () => void;

  /**
   * Register error handler
   *
   * @example
   * const transport = new ClientTransport();
   *
   * // Connect to the event stream
   * await transport.connect();
   *
   * // Register an error handler
   * transport.onError(error => {
   *   console.error(error);
   * });
   */
  onError(handler: (error: Error) => void): () => void;

  /**
   * Register connection state change handler
   *
   * @example
   * const transport = new ClientTransport();
   *
   * // Connect to the event stream
   * await transport.connect();
   *
   * // Register a connection state change handler
   * transport.onConnectionChange(connected => {
   *   console.log(`Connected: ${connected}`);
   * });
   */
  onConnectionChange(handler: (connected: boolean) => void): () => void;

  /**
   * Check if currently connected
   *
   * @example
   * const transport = new ClientTransport();
   *
   * // Connect to the event stream
   * await transport.connect();
   *
   * // Check if currently connected
   * console.log(transport.connected);
   */
  readonly connected: boolean;
};

/**
 * Client transport options
 *
 * @example
 *
 * const transport = new ClientTransport({
 *   schemas: {
 *     UserCreated: z.object({
 *       id: z.string().uuid(),
 *       email: z.string().email(),
 *       name: z.string().min(2).max(100),
 *       age: z.number().min(0).max(150),
 *       createdAt: z.string().datetime(),
 *       updatedAt: z.string().datetime().optional()
 *     })
 *   },
 *   validate: true,
 *   reconnect: {
 *     enabled: true,
 *     maxAttempts: Infinity,
 *     delay: 1000,
 *     maxDelay: 30000,
 *     multiplier: 2
 *   }
 * });
 *
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

// FIXME: review API for events (especially the way to handle emitter)
/**
 * Events API interface returned by createEvents
 *
 * @example
 * const events = createEvents({
 *   schemas: {
 *     "user.created": z.object({ id: z.string(), name: z.string() }),
 *   },
 * });
 *
 * // Create a server emitter for publishing and subscribing to events (FIXME: review API)
 * const emitter = events.createEmitter();
 *
 * // Publish an event
 * await events.publish(emitter, 'user.created', { id: '123', name: 'John' });
 *
 * // Subscribe to events
 * const subscription = await events.subscribe({
 *   "user.created": (event) => console.log(event.data.name),
 * });
 *
 * for await (const event of subscription) {
 *   console.log(event.data.name);
 * }
 *
 * // Validate event data against schema
 * const output = await events.validate('user.created', { id: '123', name: 'John' });
 * // output: { id: '123', name: 'John' }
 *
 * // Unsubscribe from events
 * await subscription.unsubscribe();
 */
export type EventsAPI<TSchemas extends EventSchemaMap> = {
  /** The event schemas */
  schemas: TSchemas;

  /**
   * Create a server emitter for publishing and subscribing to events
   */
  createEmitter(emitter: ServerEmitter<TSchemas>): ServerEmitter<TSchemas>;

  /**
   * Subscribe to events from an emitter
   *
   * @example
   * const subscription = await events.subscribe(emitter, {
   *   channel: 'user-created',
   *   filter: { id: '123' },
   * });
   *
   * for await (const event of subscription) {
   *   console.log(event.data.name);
   * }
   */
  subscribe(
    emitter: ServerEmitter<TSchemas>,
    options?: SubscribeOptions
  ): AsyncGenerator<EventMessage<TSchemas>, void, unknown>;

  /**
   * Publish an event through an emitter
   *
   * @example
   * await events.publish(emitter, 'user-created', { id: '123', name: 'John' });
   */
  publish<TEvent extends keyof TSchemas & string>(
    emitter: ServerEmitter<TSchemas>,
    event: TEvent,
    data: InferEventTypes<TSchemas>[TEvent],
    options?: PublishOptions
  ): Promise<void>;

  /**
   * Validate event data against schema
   *
   * @example
   * const output = await events.validate('user-created', { id: '123', name: 'John' });
   * // output: { id: '123', name: 'John' }
   */
  validate<TEvent extends keyof TSchemas & string>(
    event: TEvent,
    data: unknown
  ): Promise<InferEventTypes<TSchemas>[TEvent]>;
};

/**
 * Emitter factory function type, it creates a new emitter instance from the provided schemas.
 */
export type EmitterFactory<TSchemas extends EventSchemaMap> = (
  schemas: TSchemas
) => ServerEmitter<TSchemas>;

/**
 * Plugin definition type
 *
 * @example
 * const chatPlugin = new RealtimePlugin({
 *   name: 'chat',
 *   schemas: {
 *     messageCreated: {
 *       id: { type: 'string', format: 'uuid' },
 *       text: { type: 'string', minLength: 1, maxLength: 1000 },
 *     },
 *   },
 * });
 */
export type RealtimePlugin<TSchemas extends EventSchemaMap> = {
  /** Plugin name */
  name: string;
  /** Event schemas provided by this plugin */
  schemas: TSchemas;
  /** Optional helper functions */
  helpers?: Record<string, (...args: unknown[]) => unknown>;
};
