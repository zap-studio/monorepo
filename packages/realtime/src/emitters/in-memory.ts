import {
  BaseServerEmitter,
  createEventMessage,
} from "../internal/server/emitter";
import { handleSubscription } from "../internal/server/utils";
import type {
  EventDefinitions,
  EventKeys,
  EventMessage,
  InferEventTypes,
  PublishOptions,
  SubscribeOptions,
} from "../types";
import type { Subscriber } from "./types";

/**
 * In-Memory Server Emitter
 *
 * Simple pub/sub implementation for development and testing.
 * Events are broadcast to all subscribers in the same process.
 *
 * @example
 * const emitter = new InMemoryEmitter();
 */
export class InMemoryEmitter<
  TEventDefinitions extends EventDefinitions,
> extends BaseServerEmitter<TEventDefinitions> {
  private readonly subscribers: Set<Subscriber<TEventDefinitions>> = new Set();

  async *subscribe(
    options?: SubscribeOptions
  ): AsyncGenerator<EventMessage<TEventDefinitions>, void, unknown> {
    this.ensureNotClosed();

    const subscriber: Subscriber<TEventDefinitions> = {
      channel: options?.channel,
      filter: options?.filter as
        | ((event: EventMessage<TEventDefinitions>) => boolean)
        | undefined,
      queue: [],
      resolve: null,
      signal: options?.signal,
    };

    this.subscribers.add(subscriber);

    const remove = async () => this.subscribers.delete(subscriber);

    // Handle abort signal
    if (options?.signal) {
      options.signal.addEventListener("abort", async () => {
        await remove();
        if (subscriber.resolve) {
          subscriber.resolve({ value: undefined, done: true });
          subscriber.resolve = null;
        }
      });
    }

    await Promise.resolve();
    yield* handleSubscription(subscriber, remove, () => this.closed);
  }

  async publish<TEvent extends EventKeys<TEventDefinitions>>(
    event: TEvent,
    data: InferEventTypes<TEventDefinitions>[TEvent],
    options?: PublishOptions
  ): Promise<void> {
    this.ensureNotClosed();

    const message = createEventMessage<TEventDefinitions, TEvent>(
      event,
      data,
      options
    );

    for (const subscriber of this.subscribers) {
      // Check channel filter
      if (options?.channel && subscriber.channel !== options.channel) {
        continue;
      }

      // Check custom filter
      if (subscriber.filter && !subscriber.filter(message)) {
        continue;
      }

      // Deliver event
      if (subscriber.resolve) {
        subscriber.resolve({ value: message, done: false });
        subscriber.resolve = null;
      } else {
        subscriber.queue.push(message);
      }
    }

    await Promise.resolve();
  }

  close(): void {
    super.close();

    // Complete all subscribers
    for (const subscriber of this.subscribers) {
      if (subscriber.resolve) {
        subscriber.resolve({ value: undefined, done: true });
        subscriber.resolve = null;
      }
    }
    this.subscribers.clear();
  }

  /**
   * Get the current number of active subscribers
   */
  get subscriberCount(): number {
    return this.subscribers.size;
  }
}
