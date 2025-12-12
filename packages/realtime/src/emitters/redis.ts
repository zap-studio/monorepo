import {
  BaseServerEmitter,
  createEventMessage,
} from "../internal/server/emitter";
import { handleSubscription } from "../internal/server/utils";
import type {
  EventMessage,
  EventSchemaMap,
  InferEventTypes,
  PublishOptions,
  RawEventMessage,
  SubscribeOptions,
} from "../types";
import type { Subscriber } from "./types";

/**
 * Redis client should implement this interface
 * Users must provide their own Redis client instance
 */
export type RedisClient = {
  /* Publish a message to a Redis channel */
  publish(channel: string, message: string): Promise<number>;
  /* Subscribe to a Redis channel */
  subscribe(channel: string): Promise<void>;
  /* Unsubscribe from a Redis channel */
  unsubscribe(channel: string): Promise<void>;
  /* Register an event listener for Redis client events */
  on(
    event: "message",
    callback: (channel: string, message: string) => void
  ): void;
  /* Register an error handler for the Redis client */
  on(event: "error", callback: (error: Error) => void): void;
  /* Close the Redis connection */
  quit(): Promise<void>;
  /* Duplicate the Redis client with same configuration */
  duplicate(): RedisClient;
};

/**
 * Redis emitter options
 */
export type RedisEmitterOptions = {
  /** Redis client for publishing */
  publisher: RedisClient;
  /** Redis client for subscribing (will be the same as publisher if not provided) */
  subscriber?: RedisClient;
  /** Channel prefix for all pub/sub channels */
  channelPrefix?: string;
  /** Default channel name when none specified */
  defaultChannel?: string;
};

/**
 * Redis Server Emitter
 *
 * Pub/sub implementation using Redis for multi-instance deployments.
 * Allows horizontal scaling across multiple server instances.
 *
 * @example
 * const emitter = new RedisEmitter({
 *   publisher: yourRedisClient,
 *   subscriber: anotherRedisClient,
 *   channelPrefix: "realtime:",
 *   defaultChannel: "default-channel",
 * });
 */
export class RedisEmitter<
  TSchemas extends EventSchemaMap,
> extends BaseServerEmitter<TSchemas> {
  private readonly publisher: RedisClient;
  private readonly subscriber: RedisClient;
  private readonly channelPrefix: string;
  private readonly defaultChannel: string;

  /** A map of the full channel name (including prefix) to subscribers */
  private readonly subscriptions: Map<string, Set<Subscriber<TSchemas>>> =
    new Map();

  constructor(options: RedisEmitterOptions) {
    super();
    this.publisher = options.publisher;
    this.subscriber = options.subscriber ?? options.publisher.duplicate();
    this.channelPrefix = options.channelPrefix ?? "realtime:";
    this.defaultChannel = options.defaultChannel ?? "events";

    this.setupSubscriber();
  }

  private setupSubscriber(): void {
    this.subscriber.on("message", (channel: string, message: string) => {
      this.handleMessage(channel, message);
    });

    this.subscriber.on("error", (error: Error) => {
      console.error("Redis subscriber error:", error);
    });
  }

  private handleMessage(channel: string, message: string): void {
    const subscribers = this.subscriptions.get(channel);
    if (!subscribers) {
      return;
    }

    try {
      const parsed: EventMessage<TSchemas> = JSON.parse(message);

      for (const subscriber of subscribers) {
        // Check custom filter
        if (
          subscriber.filter &&
          !subscriber.filter(parsed as RawEventMessage)
        ) {
          continue;
        }

        // Deliver event
        if (subscriber.resolve) {
          subscriber.resolve({ value: parsed, done: false });
          subscriber.resolve = null;
        } else {
          subscriber.queue.push(parsed);
        }
      }
    } catch (error) {
      console.error("Failed to parse Redis message:", error);
    }
  }

  private getChannelName(channel?: string): string {
    return `${this.channelPrefix}${channel ?? this.defaultChannel}`;
  }

  async *subscribe(
    options?: SubscribeOptions
  ): AsyncGenerator<EventMessage<TSchemas>, void, unknown> {
    this.ensureNotClosed();

    const channelName = this.getChannelName(options?.channel);

    const subscriber: Subscriber<TSchemas> = {
      filter: options?.filter as
        | ((event: EventMessage<TSchemas>) => boolean)
        | undefined,
      queue: [],
      resolve: null as
        | ((value: IteratorResult<EventMessage<TSchemas>>) => void)
        | null,
      signal: options?.signal,
    };

    // Add to subscriptions
    let channelSubscribers = this.subscriptions.get(channelName);
    if (!channelSubscribers) {
      channelSubscribers = new Set();
      this.subscriptions.set(channelName, channelSubscribers);
      await this.subscriber.subscribe(channelName);
    }
    channelSubscribers.add(subscriber);

    const remove = async () => this.removeSubscriber(channelName, subscriber);

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

    yield* handleSubscription(subscriber, remove, () => this.closed);
  }

  private async removeSubscriber(
    channelName: string,
    subscriber: Subscriber<TSchemas>
  ): Promise<void> {
    const channelSubscribers = this.subscriptions.get(channelName);
    if (channelSubscribers) {
      channelSubscribers.delete(subscriber);
      if (channelSubscribers.size === 0) {
        this.subscriptions.delete(channelName);
        await this.subscriber.unsubscribe(channelName);
      }
    }
  }

  async publish<TEvent extends keyof TSchemas & string>(
    event: TEvent,
    data: InferEventTypes<TSchemas>[TEvent],
    options?: PublishOptions
  ): Promise<void> {
    this.ensureNotClosed();

    const message = createEventMessage<TSchemas, TEvent>(event, data, options);
    const channelName = this.getChannelName(options?.channel);

    await this.publisher.publish(channelName, JSON.stringify(message));
  }

  async close(): Promise<void> {
    super.close();

    // Complete all subscribers
    for (const [, subscribers] of this.subscriptions) {
      for (const subscriber of subscribers) {
        if (subscriber.resolve) {
          subscriber.resolve({ value: undefined, done: true });
          subscriber.resolve = null;
        }
      }
    }

    // Unsubscribe from all channels
    for (const channel of this.subscriptions.keys()) {
      await this.subscriber.unsubscribe(channel);
    }
    this.subscriptions.clear();

    // Close Redis connections
    await this.subscriber.quit();
  }

  /**
   * Get the current number of active subscriptions per channel
   */
  get channelStats(): Map<string, number> {
    const stats = new Map<string, number>();
    for (const [channel, subscribers] of this.subscriptions) {
      stats.set(channel, subscribers.size);
    }
    return stats;
  }
}
