import type {
  EventBusOptions,
  EventHandlers,
  EventKey,
  Handler,
} from "./types";

/**
 * A simple event bus for handling typed events.
 *
 * @example
 * const bus = new EventBus();
 *
 * // Subscribe to events
 * const unsubscribe = bus.on("join", async (payload) => {
 *   console.log("New user joined:", payload.email);
 * });
 *
 * // Emit events
 * await bus.emit("join", { email: "user@example.com" });
 *
 * // Unsubscribe
 * unsubscribe();
 *
 * // One-time listener
 * bus.once("referral", (payload) => {
 *   console.log("First referral:", payload.referrer);
 * });
 */
export class EventBus<TEventMap extends object = Record<string, unknown>> {
  private readonly logger?: EventBusOptions<TEventMap>["logger"];

  /** A mapping of event types to their handlers. */
  private handlers: EventHandlers<TEventMap> = {};

  constructor(options: EventBusOptions<TEventMap> = {}) {
    this.logger = options.logger;
  }

  /**
   * Subscribe to an event. Returns an unsubscribe function.
   *
   * @example
   * const unsubscribe = bus.on("join", async (payload) => {
   *   console.log("New user joined:", payload.email);
   * });
   */
  on<T extends EventKey<TEventMap>>(
    type: T,
    handler: Handler<TEventMap[T]>
  ): () => void {
    const list = this.getHandlers(type);
    list.push(handler);
    return () => this.off(type, handler);
  }

  /**
   * Subscribe to an event, but only fire once.
   *
   * @example
   * bus.once("referral", (payload) => {
   *   console.log("First referral:", payload.referrer);
   * });
   */
  once<T extends EventKey<TEventMap>>(
    type: T,
    handler: Handler<TEventMap[T]>
  ): () => void {
    const wrappedHandler = async (payload: TEventMap[T]) => {
      this.off(type, wrappedHandler);
      await handler(payload);
    };
    return this.on(type, wrappedHandler);
  }

  /**
   * Unsubscribe from an event.
   *
   * @example
   * const handler = async (payload) => { ... };
   * bus.on("join", handler);
   * // Later...
   * bus.off("join", handler);
   */
  off<T extends EventKey<TEventMap>>(
    type: T,
    handler: Handler<TEventMap[T]>
  ): void {
    const list = this.handlers[type];
    if (!list) {
      return;
    }

    const index = list.indexOf(handler);
    if (index > -1) {
      list.splice(index, 1);
    }
  }

  /**
   * Emit an event to all subscribed handlers.
   *
   * @example
   * await bus.emit("join", { email: "user@example.com" });
   */
  async emit<T extends EventKey<TEventMap>>(
    type: T,
    payload: TEventMap[T]
  ): Promise<void> {
    const list = [...(this.handlers[type] ?? [])];

    for (const fn of list) {
      try {
        await fn(payload);
      } catch (err) {
        this.logger?.error("EventBus: Handler error", err, { event: type });
      }
    }
  }

  /**
   * Remove all handlers for a specific event type, or all handlers if no type specified.
   *
   * @example
   * // Clear all handlers for "join" events
   * bus.clear("join");
   *
   * // Clear all handlers for all event types
   * bus.clear();
   */
  clear(type?: EventKey<TEventMap>): void {
    if (type) {
      this.handlers[type] = [];
    } else {
      this.handlers = {};
    }
  }

  /**
   * Get the number of handlers for a specific event type.
   *
   * @example
   * const count = bus.listenerCount("join");
   */
  listenerCount(type: EventKey<TEventMap>): number {
    return this.handlers[type]?.length ?? 0;
  }

  private getHandlers<T extends EventKey<TEventMap>>(
    type: T
  ): Handler<TEventMap[T]>[] {
    const existing = this.handlers[type];
    if (existing) {
      return existing;
    }

    const next: Handler<TEventMap[T]>[] = [];
    this.handlers[type] = next;
    return next;
  }
}
