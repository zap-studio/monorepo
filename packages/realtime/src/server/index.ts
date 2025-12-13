import { validateSchema } from "../schema";
import type {
  EventDefinitions,
  EventsAPI,
  InferEventTypes,
  ServerEmitter,
} from "../types";

/**
 * Create a type-safe events API from a schema map
 *
 * @throws Error if an unknown event type is provided
 * @throws ValidationError if the data does not match the schema
 *
 * @example
 * ```ts
 * import { z } from "zod";
 * import { createEvents } from "@zap-studio/realtime";
 * import { type EventDefinitions } from "@zap-studio/realtime/types";
 *
 * // Define event schemas using any Standard Schema library
 * const allEvents: EventDefinitions = {
 *   message: z.object({ title: z.string(), body: z.string() }),
 *   userPresence: z.object({ userId: z.string(), online: z.boolean() })
 * };
 *
 * // Create a type-safe events API from the schema map
 * export const events = createEvents(allEvents);
 *
 * // Publish an event
 * await events.publish("message", { title: "Hello", body: "World" });
 *
 * // Subscribe to events
 * for await (const event of events.subscribe()) {
 *   console.log(event);
 * }
 *
 * // Validate an event
 * const result = await events.validate("message", { title: "Hello", body: "World" });
 * console.log(result);
 * // result is { title: "Hello", body: "World" }
 * ```
 */
export function createEvents<
  TEventDefinitions extends EventDefinitions,
  TEmitter extends ServerEmitter<TEventDefinitions>,
>(
  definitions: TEventDefinitions,
  emitter: TEmitter
): EventsAPI<TEventDefinitions> {
  return {
    definitions,

    async validate<TEvent extends keyof TEventDefinitions>(
      event: TEvent,
      data: unknown
    ): Promise<InferEventTypes<TEventDefinitions>[TEvent]> {
      const schema = definitions[event];
      if (!schema) {
        throw new Error(`Unknown event type: ${String(event)}`);
      }

      const result = await validateSchema(schema, data);
      return result as InferEventTypes<TEventDefinitions>[TEvent];
    },

    publish(event, data, options) {
      return emitter.publish(event, data, options);
    },

    subscribe(options) {
      return emitter.subscribe(options);
    },
  };
}
