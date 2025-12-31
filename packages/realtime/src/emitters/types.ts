import type { EventDefinitions, EventMessage, RawEventMessage } from "../types";

/**
 * Represents a subscriber for an event emitter.
 *
 * Subscribers are used internally to manage event delivery, filtering, and
 * queueing for both in-memory and Redis-based emitters.
 */
export type Subscriber<TEventDefinitions extends EventDefinitions> = {
  /**
   * Optional channel name this subscriber is listening to.
   * If undefined, subscriber may receive events from default or broadcast channels.
   */
  channel?: string;

  /**
   * Optional filter function to selectively receive events.
   * Only events for which the filter returns `true` will be delivered to this subscriber.
   */
  filter?: (
    event: EventMessage<TEventDefinitions> | RawEventMessage
  ) => boolean;

  /**
   * Queue of pending events for this subscriber.
   * Events are stored here if they cannot be immediately delivered.
   */
  queue: EventMessage<TEventDefinitions>[];

  /**
   * Optional resolve function used internally to push the next event to an
   * AsyncGenerator consumer.
   * When a new event arrives, this function is called to resolve the awaiting promise.
   */
  resolve:
    | ((value: IteratorResult<EventMessage<TEventDefinitions>>) => void)
    | null;

  /**
   * Optional AbortSignal that allows the subscription to be canceled.
   * If the signal is triggered, the subscriber is removed and the generator completes.
   */
  signal?: AbortSignal;
};
