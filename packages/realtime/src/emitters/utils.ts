import type {
  EventDefinitions,
  EventKeys,
  EventMessage,
  InferEventTypes,
  PublishOptions,
} from "../types";
import type { Subscriber } from "./types";

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
  TEvent extends EventKeys<TEventDefinitions> = EventKeys<TEventDefinitions>,
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
 * Handles the subscription logic for an `AsyncGenerator` of events.
 *
 * This helper function is used internally by emitters
 * to manage delivering queued events to a subscriber, applying filters,
 * and resolving promises for the generator.
 *
 * It will continue yielding events until the subscriber is aborted or the emitter is closed.
 */
export async function* handleSubscription<
  TEventDefinitions extends EventDefinitions,
>(
  subscriber: Subscriber<TEventDefinitions>,
  removeSubscriber: () => Promise<void> | Promise<boolean>,
  closed: () => boolean
): AsyncGenerator<EventMessage<TEventDefinitions>, void, unknown> {
  try {
    while (!(closed() || subscriber.signal?.aborted)) {
      if (subscriber.queue.length > 0) {
        const event = subscriber.queue.shift();
        if (event) {
          yield event;
        }
        continue;
      }

      const event = await new Promise<
        IteratorResult<EventMessage<TEventDefinitions>>
      >((resolve) => {
        subscriber.resolve = resolve;
      });

      if (event.done) {
        return;
      }

      yield event.value;
    }
  } finally {
    await removeSubscriber();
  }
}
