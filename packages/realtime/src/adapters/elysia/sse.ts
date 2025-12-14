import type { Context } from "elysia";
import { createSSEResponse } from "../../transport/sse/server";
import type {
  EventDefinitions,
  EventsAPI,
  ServerTransportOptions,
} from "../../types";

/**
 * Options for Elysia SSE handler
 */
export type ElysiaSSEHandlerOptions = ServerTransportOptions & {
  /**
   * Heartbeat interval in milliseconds
   * @default 30000
   */
  heartbeatInterval?: number;
};

/**
 * Create an Elysia SSE route handler
 *
 * @example
 * ```ts
 * import { Elysia } from "elysia";
 * import { events } from "@/lib/events";
 * import { elysiaSSEHandler } from "@zap-studio/realtime/adapters/elysia/sse";
 *
 * const app = new Elysia().get("/events", elysiaSSEHandler(events));
 * ```
 */
export function elysiaSSEHandler<
  TEventDefinitions extends EventDefinitions,
  TContext extends Context,
>(
  events: EventsAPI<TEventDefinitions>,
  options?: ElysiaSSEHandlerOptions
): (context: TContext) => Promise<Response> {
  return async (context: TContext): Promise<Response> => {
    const request = context.request;
    const subscription = events.subscribe(request);

    return await Promise.resolve(
      createSSEResponse(subscription, {
        ...options,
        signal: context.request.signal,
      })
    );
  };
}

/**
 * Create an Elysia SSE route handler with params
 *
 * @example
 * ```ts
 * import { Elysia } from "elysia";
 * import { events } from "@/lib/events";
 * import { elysiaSSEHandlerWithParams } from "@zap-studio/realtime/adapters/elysia/sse";
 *
 * const app = new Elysia().get("/events/:channel", elysiaSSEHandlerWithParams(events));
 * ```
 */
export function elysiaSSEHandlerWithParams<
  TEventDefinitions extends EventDefinitions,
  TContext extends Context,
>(
  events: EventsAPI<TEventDefinitions>,
  options?: ElysiaSSEHandlerOptions
): (context: TContext) => Promise<Response> {
  return async (context: TContext): Promise<Response> => {
    const request = context.request;
    const subscription = events.subscribe({
      ...request,
      channel: context.params.channel,
    });

    return await Promise.resolve(
      createSSEResponse(subscription, {
        ...options,
        signal: context.request.signal,
      })
    );
  };
}
