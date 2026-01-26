import type { EventPayloadMap, WaitlistEventType } from "./types";

/** A function that handles events within the waitlist and takes a payload */
type Handler<T> = (payload: T) => void | Promise<void>;

/**
 * A simple event bus for handling waitlist-related events.
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
export class EventBus {
  /** A mapping of event types to their handlers. */
  private handlers: {
    [K in WaitlistEventType]: Handler<EventPayloadMap[K]>[];
  } = {
    join: [],
    referral: [],
    leave: [],
    error: [],
  };

  /**
   * Subscribe to an event. Returns an unsubscribe function.
   *
   * @example
   * const unsubscribe = bus.on("join", async (payload) => {
   *   console.log("New user joined:", payload.email);
   * });
   */
  on<T extends WaitlistEventType>(
    type: T,
    handler: Handler<EventPayloadMap[T]>
  ): () => void {
    this.handlers[type].push(handler);
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
  once<T extends WaitlistEventType>(
    type: T,
    handler: Handler<EventPayloadMap[T]>
  ): () => void {
    const wrappedHandler = async (payload: EventPayloadMap[T]) => {
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
  off<T extends WaitlistEventType>(
    type: T,
    handler: Handler<EventPayloadMap[T]>
  ): void {
    const index = this.handlers[type].indexOf(handler);
    if (index > -1) {
      this.handlers[type].splice(index, 1);
    }
  }

  /**
   * Emit an event to all subscribed handlers.
   *
   * @example
   * await bus.emit("join", { email: "user@example.com" });
   */
  async emit<T extends WaitlistEventType>(
    type: T,
    payload: EventPayloadMap[T]
  ): Promise<void> {
    const list = [...(this.handlers[type] ?? [])];

    for (const fn of list) {
      try {
        await fn(payload);
      } catch (err) {
        if (type !== "error") {
          try {
            // Emit error event if handler throws
            await this.emit("error", {
              err,
              source: type,
            });
          } catch (errorEmitFailed) {
            // Log the failure if emitting the error event fails
            console.error(
              "EventBus: Failed to emit error event",
              err,
              errorEmitFailed
            );
          }
        } else {
          // If an error handler itself throws, just log it
          console.error("EventBus: Error handler threw an error", err);
        }
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
  clear(type?: WaitlistEventType): void {
    if (type) {
      this.handlers[type] = [];
    } else {
      this.handlers = {
        join: [],
        referral: [],
        leave: [],
        error: [],
      };
    }
  }

  /**
   * Get the number of handlers for a specific event type.
   *
   * @example
   * const count = bus.listenerCount("join");
   */
  listenerCount(type: WaitlistEventType): number {
    return this.handlers[type].length;
  }
}
