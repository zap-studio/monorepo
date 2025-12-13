import { validateSchema } from "../../schema";
import type {
  ClientTransport,
  ClientTransportOptions,
  EventSchemaMap,
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
 * SSE Client Transport
 *
 * Wraps EventSource for type-safe event handling with schema validation
 */
export class SSEClientTransport<TSchemas extends EventSchemaMap>
  implements ClientTransport<TSchemas>
{
  private readonly url: string;
  private readonly schemas: TSchemas;
  private readonly validate: boolean;
  private readonly reconnectEnabled: boolean;
  private readonly reconnectMaxAttempts: number;
  private readonly reconnectDelay: number;
  private readonly reconnectMaxDelay: number;
  private readonly reconnectMultiplier: number;

  private eventSource: EventSource | null = null;
  private readonly eventHandlers: Map<string, Set<(data: unknown) => void>> =
    new Map();
  private readonly anyHandlers: Set<(event: string, data: unknown) => void> =
    new Set();
  private readonly errorHandlers: Set<(error: Error) => void> = new Set();
  private readonly connectionHandlers: Set<(connected: boolean) => void> =
    new Set();
  private isConnected = false;
  private reconnectAttempts = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(url: string, options: ClientTransportOptions<TSchemas>) {
    this.url = url;
    this.schemas = options.schemas;
    this.validate = options.validate ?? true;

    const reconnect = options.reconnect ?? {};
    this.reconnectEnabled = reconnect.enabled ?? true;
    this.reconnectMaxAttempts =
      reconnect.maxAttempts ?? Number.POSITIVE_INFINITY;
    this.reconnectDelay = reconnect.delay ?? 1000;
    this.reconnectMaxDelay = reconnect.maxDelay ?? 30_000;
    this.reconnectMultiplier = reconnect.multiplier ?? 2;
  }

  get connected(): boolean {
    return this.isConnected;
  }

  connect(): void {
    if (this.eventSource) {
      return;
    }

    this.createEventSource();
  }

  disconnect(): void {
    this.clearReconnectTimer();
    this.reconnectAttempts = 0;

    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }

    if (this.isConnected) {
      this.isConnected = false;
      this.notifyConnectionChange(false);
    }
  }

  on<TEvent extends keyof TSchemas & string>(
    event: TEvent,
    handler: (data: InferEventTypes<TSchemas>[TEvent]) => void
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

  onAny(
    handler: <TEvent extends keyof TSchemas & string>(
      event: TEvent,
      data: InferEventTypes<TSchemas>[TEvent]
    ) => void
  ): () => void {
    this.anyHandlers.add(handler);
    return () => {
      this.anyHandlers.delete(handler);
    };
  }

  onError(handler: (error: Error) => void): () => void {
    this.errorHandlers.add(handler);
    return () => {
      this.errorHandlers.delete(handler);
    };
  }

  onConnectionChange(handler: (connected: boolean) => void): () => void {
    this.connectionHandlers.add(handler);
    return () => {
      this.connectionHandlers.delete(handler);
    };
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

  private registerEventListener(event: string): void {
    if (!this.eventSource) {
      return;
    }

    this.eventSource.addEventListener(event, async (e: Event) => {
      const messageEvent = e as MessageEvent;
      try {
        const parsed: ParsedEventData = JSON.parse(messageEvent.data);
        let data = parsed.data;

        // Validate against schema if enabled
        if (this.validate) {
          const schema = this.schemas[event];
          if (schema) {
            data = await validateSchema(schema, data);
          }
        }

        // Notify specific handlers
        const handlers = this.eventHandlers.get(event);
        if (handlers) {
          for (const handler of handlers) {
            try {
              handler(data);
            } catch (handlerError) {
              this.notifyError(
                handlerError instanceof Error
                  ? handlerError
                  : new Error(String(handlerError))
              );
            }
          }
        }

        // Notify any handlers
        for (const handler of this.anyHandlers) {
          try {
            handler(event, data);
          } catch (handlerError) {
            this.notifyError(
              handlerError instanceof Error
                ? handlerError
                : new Error(String(handlerError))
            );
          }
        }
      } catch (error) {
        this.notifyError(
          error instanceof Error ? error : new Error(String(error))
        );
      }
    });
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
      try {
        handler(error);
      } catch {
        // Ignore errors in error handlers
      }
    }
  }

  private notifyConnectionChange(connected: boolean): void {
    for (const handler of this.connectionHandlers) {
      try {
        handler(connected);
      } catch {
        // Ignore errors in connection handlers
      }
    }
  }
}
