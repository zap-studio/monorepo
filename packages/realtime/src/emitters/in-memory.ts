import { BaseServerEmitter, createEventMessage } from "../server/emitter";
import type {
  EventMessage,
  EventSchemaMap,
  InferEventTypes,
  PublishOptions,
  SubscribeOptions,
} from "../types";

/**
 * Subscriber entry in the in-memory emitter
 */
type Subscriber<TSchemas extends EventSchemaMap> = {
  /* Channel name */
  channel?: string;
  /* Filter function */
  filter?: (event: EventMessage<TSchemas>) => boolean;
  /* Queue of events */
  queue: EventMessage<TSchemas>[];
  /* Resolve function */
  resolve: ((value: IteratorResult<EventMessage<TSchemas>>) => void) | null;
  /* Abort signal */
  signal?: AbortSignal;
};

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
  TSchemas extends EventSchemaMap,
> extends BaseServerEmitter<TSchemas> {
  private readonly subscribers: Set<Subscriber<TSchemas>> = new Set();

  async *subscribe(
    options?: SubscribeOptions
  ): AsyncGenerator<EventMessage<TSchemas>, void, unknown> {
    this.ensureNotClosed();

    const subscriber: Subscriber<TSchemas> = {
      channel: options?.channel,
      filter: options?.filter as
        | ((event: EventMessage<TSchemas>) => boolean)
        | undefined,
      queue: [],
      resolve: null,
      signal: options?.signal,
    };

    this.subscribers.add(subscriber);

    // Handle abort signal
    if (options?.signal) {
      options.signal.addEventListener("abort", () => {
        this.subscribers.delete(subscriber);
        if (subscriber.resolve) {
          subscriber.resolve({ value: undefined, done: true });
          subscriber.resolve = null;
        }
      });
    }

    try {
      while (!(this.closed || options?.signal?.aborted)) {
        // Check if there are queued events
        if (subscriber.queue.length > 0) {
          const event = subscriber.queue.shift();
          if (event) {
            yield event;
            continue;
          }
        }

        // Wait for next event
        const event = await new Promise<IteratorResult<EventMessage<TSchemas>>>(
          (resolve) => {
            subscriber.resolve = resolve;
          }
        );

        if (event.done) {
          return;
        }

        yield event.value;
      }
    } finally {
      this.subscribers.delete(subscriber);
    }
  }

  async publish<TEvent extends keyof TSchemas & string>(
    event: TEvent,
    data: InferEventTypes<TSchemas>[TEvent],
    options?: PublishOptions
  ): Promise<void> {
    this.ensureNotClosed();

    const message = createEventMessage<TSchemas, TEvent>(event, data, options);

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
