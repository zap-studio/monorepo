import type {
  EventDefinitions,
  EventKeys,
  EventMessage,
  InferEventTypes,
  PublishOptions,
  ServerEmitter,
  SubscribeOptions,
} from "../types";

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

  abstract publish<
    TEvent extends EventKeys<TEventDefinitions> = EventKeys<TEventDefinitions>,
  >(
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
