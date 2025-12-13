import type {
  EventDefinitions,
  EventMessage,
  InferEventTypes,
  PublishOptions,
  ServerEmitter,
  SubscribeOptions,
} from "../../types";

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
  TEventDefinitions extends EventDefinitions,
  TEvent extends keyof TEventDefinitions,
>(
  event: TEvent,
  data: InferEventTypes<TEventDefinitions>[TEvent],
  options?: PublishOptions
): EventMessage<TEventDefinitions, TEvent> {
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
export abstract class BaseServerEmitter<
  TEventDefinitions extends EventDefinitions,
> implements ServerEmitter<TEventDefinitions>
{
  protected closed = false;

  abstract subscribe(
    options?: SubscribeOptions
  ): AsyncGenerator<EventMessage<TEventDefinitions>, void, unknown>;

  abstract publish<TEvent extends keyof TEventDefinitions>(
    event: TEvent,
    data: InferEventTypes<TEventDefinitions>[TEvent],
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
