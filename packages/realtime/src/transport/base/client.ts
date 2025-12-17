import { standardValidate } from "@zap-studio/validation";
import type {
  ClientTransport,
  ClientTransportOptions,
  EventDefinitions,
  EventKeys,
  InferEventTypes,
} from "../../types";

/**
 * Handler function for a specific event type
 */
export type EventHandler<
  TEventDefinitions extends EventDefinitions,
  TEvent extends EventKeys<TEventDefinitions> = EventKeys<TEventDefinitions>,
> = (data: InferEventTypes<TEventDefinitions>[TEvent]) => void;

/**
 * Generic handler function for any event type
 */
export type AnyEventHandler<TEventDefinitions extends EventDefinitions> = <
  TEvent extends EventKeys<TEventDefinitions> = EventKeys<TEventDefinitions>,
>(
  event: TEvent,
  data: InferEventTypes<TEventDefinitions>[TEvent]
) => void;

/**
 * Reconnection configuration extracted from options
 */
export type ReconnectConfig = {
  enabled: boolean;
  maxAttempts: number;
  delay: number;
  maxDelay: number;
  multiplier: number;
};

/**
 * Base Client Transport
 *
 * Abstract base class for client transports that provides common functionality
 * for event handling, reconnection logic, and connection state management.
 *
 * Subclasses must implement:
 * - `createConnection()` - Create the underlying connection (EventSource/WebSocket)
 * - `closeConnection()` - Close the underlying connection
 * - `onFirstHandler(event)` - Called when first handler is registered for an event (optional)
 */
export abstract class BaseClientTransport<
  TEventDefinitions extends EventDefinitions,
> implements ClientTransport<TEventDefinitions>
{
  protected readonly url: string;
  protected readonly definitions: TEventDefinitions;
  protected readonly validate: boolean;
  protected readonly reconnectConfig: ReconnectConfig;

  protected readonly eventHandlers: Map<
    EventKeys<TEventDefinitions>,
    Set<EventHandler<TEventDefinitions>>
  > = new Map();
  protected readonly anyHandlers: Set<AnyEventHandler<TEventDefinitions>> =
    new Set();
  protected readonly errorHandlers: Set<(error: Error) => void> = new Set();
  protected readonly connectionHandlers: Set<(connected: boolean) => void> =
    new Set();

  protected isConnectedState = false;
  protected reconnectAttempts = 0;
  protected reconnectTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(url: string, options: ClientTransportOptions<TEventDefinitions>) {
    this.url = url;
    this.definitions = options.definitions;
    this.validate = options.validate ?? true;

    const reconnect = options.reconnect ?? {};
    this.reconnectConfig = {
      enabled: reconnect.enabled ?? true,
      maxAttempts: reconnect.maxAttempts ?? Number.POSITIVE_INFINITY,
      delay: reconnect.delay ?? 1000,
      maxDelay: reconnect.maxDelay ?? 30_000,
      multiplier: reconnect.multiplier ?? 2,
    };
  }

  /**
   * Returns the current connection status
   */
  get connected(): boolean {
    return this.isConnectedState;
  }

  /**
   * Connect to the server
   */
  abstract connect(): void;

  /**
   * Disconnect from the server
   */
  disconnect(): void {
    this.clearReconnectTimer();
    this.reconnectAttempts = 0;
    this.closeConnection();

    if (this.isConnectedState) {
      this.isConnectedState = false;
      this.notifyConnectionChange(false);
    }
  }

  /**
   * Register an event listener for the specified event
   */
  on<TEvent extends EventKeys<TEventDefinitions>>(
    event: TEvent,
    handler: (data: InferEventTypes<TEventDefinitions>[TEvent]) => void
  ): () => void {
    let handlers = this.eventHandlers.get(event);

    if (!handlers) {
      handlers = new Set();
      this.eventHandlers.set(event, handlers);
      this.onFirstHandler(event);
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
   * Register an event listener for any event
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
   * Register an error listener
   */
  onError(handler: (error: Error) => void): () => void {
    this.errorHandlers.add(handler);
    return () => this.errorHandlers.delete(handler);
  }

  /**
   * Register a connection change listener
   */
  onConnectionChange(handler: (connected: boolean) => void): () => void {
    this.connectionHandlers.add(handler);
    return () => this.connectionHandlers.delete(handler);
  }

  /**
   * Close the underlying connection
   * Subclasses must implement this to close their specific connection type
   */
  protected abstract closeConnection(): void;

  /**
   * Called when the first handler is registered for an event
   * Subclasses can override this to perform additional setup (e.g., SSE event listeners)
   */
  protected onFirstHandler(_event: EventKeys<TEventDefinitions>): void {
    // Default: no-op, subclasses can override
  }

  /**
   * Dispatch an event to all registered handlers
   */
  protected dispatchEvent<TEvent extends EventKeys<TEventDefinitions>>(
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

  /**
   * Validate event data against its schema
   */
  protected async validateEventData<
    TEvent extends EventKeys<TEventDefinitions>,
  >(
    event: TEvent,
    data: unknown
  ): Promise<InferEventTypes<TEventDefinitions>[TEvent]> {
    if (!this.validate) {
      return data as InferEventTypes<TEventDefinitions>[TEvent];
    }

    const schema = this.definitions[event];
    if (schema) {
      return (await standardValidate(
        schema,
        data,
        true
      )) as InferEventTypes<TEventDefinitions>[TEvent];
    }

    return data as InferEventTypes<TEventDefinitions>[TEvent];
  }

  /**
   * Handle reconnection with exponential backoff
   */
  protected handleReconnect(createConnection: () => void): void {
    if (
      !this.reconnectConfig.enabled ||
      this.reconnectAttempts >= this.reconnectConfig.maxAttempts
    ) {
      this.notifyError(
        new Error(
          `Connection closed. Max reconnect attempts (${this.reconnectConfig.maxAttempts}) reached.`
        )
      );
      return;
    }

    const delay = Math.min(
      this.reconnectConfig.delay *
        this.reconnectConfig.multiplier ** this.reconnectAttempts,
      this.reconnectConfig.maxDelay
    );

    this.reconnectAttempts += 1;

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      createConnection();
    }, delay);
  }

  /**
   * Clear the reconnect timer
   */
  protected clearReconnectTimer(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  /**
   * Notify all error handlers
   */
  protected notifyError(error: Error): void {
    for (const handler of this.errorHandlers) {
      this.safeCall(() => handler(error));
    }
  }

  /**
   * Notify all connection change handlers
   */
  protected notifyConnectionChange(connected: boolean): void {
    for (const handler of this.connectionHandlers) {
      this.safeCall(() => handler(connected));
    }
  }

  /**
   * Safely call a function, swallowing any errors
   */
  protected safeCall(fn: () => void): void {
    try {
      fn();
    } catch {
      // intentionally ignored
    }
  }

  /**
   * Reset connection state on successful connection
   */
  protected onConnectionEstablished(): void {
    this.isConnectedState = true;
    this.reconnectAttempts = 0;
    this.notifyConnectionChange(true);
  }

  /**
   * Handle connection loss
   */
  protected onConnectionLost(): void {
    const wasConnected = this.isConnectedState;
    this.isConnectedState = false;

    if (wasConnected) {
      this.notifyConnectionChange(false);
    }
  }
}
