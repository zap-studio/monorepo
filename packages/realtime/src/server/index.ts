import { validateSchema } from "../schema";
import type {
  EventDefinitions,
  EventKeys,
  EventMessage,
  EventsAPI,
  InferEventTypes,
  PublishOptions,
  ServerEmitter,
  SubscribeOptions,
} from "../types";

/**
 * Type-safe Events class to manage event definitions and emit events
 *
 * @example
 * import { InMemoryEmitter } from "@zap-studio/realtime/emitters/in-memory";
 *
 * const emitter = new InMemoryEmitter();
 *
 * const events = new Events(emitter, {
 *   userCreated: {
 *     type: "userCreated",
 *     schema: z.object({
 *       id: z.string().uuid(),
 *       email: z.string().email(),
 *     }),
 *   },
 * });
 *
 * // Publish an event
 * events.publish("userCreated", { id: "123", email: "test@example.com" });
 *
 * // Subscribe to events
 * for await (const message of events.subscribe()) {
 *   console.log(message);
 * }
 *
 * // Validate event data
 * const data = await events.validate("userCreated", { id: "123", email: "test@example.com" });
 * console.log(data);
 * // data is { id: "123", email: "test@example.com" }
 */
export class Events<
  TEventDefinitions extends EventDefinitions,
  TEmitter extends ServerEmitter<TEventDefinitions>,
> implements EventsAPI<TEventDefinitions>
{
  private readonly definitions: TEventDefinitions;
  private readonly emitter: TEmitter;

  constructor(emitter: TEmitter, definitions: TEventDefinitions) {
    this.emitter = emitter;
    this.definitions = definitions;
  }

  /**
   * Validate event data against its schema
   */
  async validate<TEvent extends EventKeys<TEventDefinitions>>(
    event: TEvent,
    data: unknown
  ): Promise<InferEventTypes<TEventDefinitions>[TEvent]> {
    const schema = this.definitions[event];
    if (!schema) {
      throw new Error(`Unknown event type: ${String(event)}`);
    }

    const result = await validateSchema(schema, data);
    return result as InferEventTypes<TEventDefinitions>[TEvent];
  }

  /**
   * Publish an event
   */
  async publish<TEvent extends EventKeys<TEventDefinitions>>(
    event: TEvent,
    data: InferEventTypes<TEventDefinitions>[TEvent],
    options?: PublishOptions
  ): Promise<void> {
    return await this.emitter.publish(event, data, options);
  }

  /**
   * Subscribe to events
   */
  async *subscribe(
    options?: SubscribeOptions
  ): AsyncGenerator<
    EventMessage<TEventDefinitions, EventKeys<TEventDefinitions>>,
    void,
    unknown
  > {
    await Promise.resolve();
    yield* this.emitter.subscribe(options);
  }
}
