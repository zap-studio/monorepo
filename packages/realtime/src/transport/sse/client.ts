import { validateSchema } from "../../schema";
import type {
  ClientTransport,
  ClientTransportOptions,
  EventDefinitions,
  EventKeys,
  InferEventTypes,
} from "../../types";

/**
 * Parsed SSE event data
 */
type ParsedEventData = {
  data: unknown;
  timestamp: number;
};

/**
 * Handler function for a specific event type.
 */
type EventHandler<
  TEventDefinitions extends EventDefinitions,
  TEvent extends EventKeys<TEventDefinitions> = EventKeys<TEventDefinitions>,
> = (data: InferEventTypes<TEventDefinitions>[TEvent]) => void;

/**
 * Generic handler function for any event type.
 */
type AnyEventHandler<TEventDefinitions extends EventDefinitions> = <
  TEvent extends EventKeys<TEventDefinitions> = EventKeys<TEventDefinitions>,
>(
  event: TEvent,
  data: InferEventTypes<TEventDefinitions>[TEvent]
) => void;

/**
 * SSE Client Transport
 *
 * Wraps EventSource for type-safe event handling with schema validation
 */
export class SSEClientTransport<TEventDefinitions extends EventDefinitions>
  implements ClientTransport<TEventDefinitions>
{
  private readonly url: string;
  private readonly definitions: TEventDefinitions;
  private readonly validate: boolean;

  private readonly reconnectEnabled: boolean;
  private readonly reconnectMaxAttempts: number;
  private readonly reconnectDelay: number;
  private readonly reconnectMaxDelay: number;
  private readonly reconnectMultiplier: number;

  private eventSource: EventSource | null = null;

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

  constructor(url: string, options: ClientTransportOptions<TEventDefinitions>) {
    this.url = url;
    this.definitions = options.definitions;
    this.validate = options.validate ?? true;

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
   * Connects to the SSE server.
   */
  connect(): void {
    if (!this.eventSource) {
      this.createEventSource();
    }
  }

  /**
   * Disconnects from the SSE server.
   */
  disconnect(): void {
    this.clearReconnectTimer();
    this.reconnectAttempts = 0;

    this.eventSource?.close();
    this.eventSource = null;

    if (this.isConnected) {
      this.isConnected = false;
      this.notifyConnectionChange(false);
    }
  }

  /**
   * Registers an event listener for the specified event.
   */
  on<
    TEvent extends EventKeys<TEventDefinitions> = EventKeys<TEventDefinitions>,
  >(
    event: TEvent,
    handler: (data: InferEventTypes<TEventDefinitions>[TEvent]) => void
  ): () => void {
    let handlers = this.eventHandlers.get(event);

    if (!handlers) {
      handlers = new Set();
      this.eventHandlers.set(event, handlers);
      this.registerEventListener(event);
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
    handler: <
      TEvent extends
        EventKeys<TEventDefinitions> = EventKeys<TEventDefinitions>,
    >(
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

  private createEventSource(): void {
    this.eventSource = new EventSource(this.url);

    this.eventSource.onopen = () => {
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.notifyConnectionChange(true);
    };

    this.eventSource.onerror = () => {
      const wasConnected = this.isConnected;
      this.isConnected = false;

      if (wasConnected) {
        this.notifyConnectionChange(false);
      }

      if (this.eventSource?.readyState === EventSource.CLOSED) {
        this.eventSource = null;
        this.handleReconnect();
      } else {
        this.notifyError(new Error("SSE connection error"));
      }
    };

    // Re-register all event listeners
    for (const event of this.eventHandlers.keys()) {
      this.registerEventListener(event);
    }
  }

  private registerEventListener<
    TEvent extends EventKeys<TEventDefinitions> = EventKeys<TEventDefinitions>,
  >(event: TEvent): void {
    if (!this.eventSource) {
      return;
    }

    this.eventSource.addEventListener(event, (e) => {
      this.handleEvent(event, e);
    });
  }

  private async handleEvent<
    TData extends string,
    TEvent extends EventKeys<TEventDefinitions> = EventKeys<TEventDefinitions>,
  >(event: TEvent, e: MessageEvent<TData>): Promise<void> {
    try {
      const data = await this.parseAndValidate(event, e.data);
      this.dispatchEvent(event, data);
    } catch (error) {
      this.notifyError(
        error instanceof Error ? error : new Error(String(error))
      );
    }
  }

  private async parseAndValidate<
    TEvent extends EventKeys<TEventDefinitions> = EventKeys<TEventDefinitions>,
  >(
    event: TEvent,
    rawData: string
  ): Promise<InferEventTypes<TEventDefinitions>[TEvent]> {
    const parsed: ParsedEventData = JSON.parse(rawData);
    let data = parsed.data;

    if (this.validate) {
      const schema = this.definitions[event];
      if (schema) {
        data = await validateSchema(schema, data);
      }
    }

    return data as InferEventTypes<TEventDefinitions>[TEvent];
  }

  private dispatchEvent<
    TEvent extends EventKeys<TEventDefinitions> = EventKeys<TEventDefinitions>,
  >(event: TEvent, data: InferEventTypes<TEventDefinitions>[TEvent]): void {
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
          `SSE connection closed. Max reconnect attempts (${this.reconnectMaxAttempts}) reached.`
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
      this.createEventSource();
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
