import type { Subscriber } from "../../emitters/types";
import type { EventDefinitions, EventMessage } from "../../types";

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
