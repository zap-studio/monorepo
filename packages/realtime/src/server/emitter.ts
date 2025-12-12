import type {
  EventMessage,
  EventSchemaMap,
  InferEventTypes,
  PublishOptions,
  ServerEmitter,
  SubscribeOptions,
} from "../types";

/**
 * Generate a unique event ID
 */
export function generateEventId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

/**
 * Create an event message
 */
export function createEventMessage<
  TSchemas extends EventSchemaMap,
  TEvent extends keyof TSchemas & string,
>(
  event: TEvent,
  data: InferEventTypes<TSchemas>[TEvent],
  options?: PublishOptions
): EventMessage<TSchemas, TEvent> {
  return {
    id: generateEventId(),
    event,
    data,
    timestamp: Date.now(),
    retry: options?.retry,
  };
}

/**
 * Abstract base class for server emitters
 * Provides common functionality for all emitter implementations
 */
export abstract class BaseServerEmitter<TSchemas extends EventSchemaMap>
  implements ServerEmitter<TSchemas>
{
  protected closed = false;

  abstract subscribe(
    options?: SubscribeOptions
  ): AsyncGenerator<EventMessage<TSchemas>, void, unknown>;

  abstract publish<TEvent extends keyof TSchemas & string>(
    event: TEvent,
    data: InferEventTypes<TSchemas>[TEvent],
    options?: PublishOptions
  ): Promise<void>;

  close(): void {
    this.closed = true;
  }

  protected ensureNotClosed(): void {
    if (this.closed) {
      throw new Error("Emitter has been closed");
    }
  }
}
