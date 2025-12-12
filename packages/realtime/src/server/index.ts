import { validateSchema } from "../schema";
import type {
  EventSchemaMap,
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
 * import { type EventSchemaMap } from "./types";
 *
 * // Define event schemas using any Standard Schema library
 * const allEvents: EventSchemaMap = {
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
  TSchemas extends EventSchemaMap,
  TEmitter extends ServerEmitter<TSchemas>,
>(schemas: TSchemas, emitter: TEmitter): EventsAPI<TSchemas> {
  return {
    schemas,

    async validate<TEvent extends keyof TSchemas & string>(
      event: TEvent,
      data: unknown
    ): Promise<InferEventTypes<TSchemas>[TEvent]> {
      const schema = schemas[event];
      if (!schema) {
        throw new Error(`Unknown event type: ${String(event)}`);
      }

      const result = await validateSchema(schema, data);
      return result as InferEventTypes<TSchemas>[TEvent];
    },

    publish(event, data, options) {
      return emitter.publish(event, data, options);
    },

    subscribe(options) {
      return emitter.subscribe(options);
    },
  };
}
