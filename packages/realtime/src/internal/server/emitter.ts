import type {
  EventDefinitions,
  EventMessage,
  InferEventTypes,
  PublishOptions,
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
