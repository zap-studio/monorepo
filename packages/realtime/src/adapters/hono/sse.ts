import type { Context, Env, Input } from "hono";

import { createSSEResponse } from "../../transport/sse/server";
import type {
  EventDefinitions,
  EventsAPI,
  ServerTransportOptions,
} from "../../types";

/**
 * Options for Hono SSE handler
 */
export type HonoSSEHandlerOptions = ServerTransportOptions & {
  /**
   * Heartbeat interval in milliseconds
   * @default 30000
   */
  heartbeatInterval?: number;
};

/**
 * Create a Hono SSE route handler
 *
 * @example
 * ```ts
 * import { Hono } from 'hono'
 * import { events } from '@/lib/events'
 * import { honoSSEHandler } from '@zap-studio/realtime/adapters/hono/sse'
 *
 * const app = new Hono()
 *
 * app.get('/api/events', honoSSEHandler(events))
 * ```
 */
export function honoSSEHandler<
  TEventDefinitions extends EventDefinitions,
  // biome-ignore lint/suspicious/noExplicitAny: Defined as is in Context
  E extends Env = any,
  // biome-ignore lint/suspicious/noExplicitAny: Defined as is in Context
  P extends string = any,
  // biome-ignore lint/complexity/noBannedTypes: Defined as is in Context
  I extends Input = {},
>(
  events: EventsAPI<TEventDefinitions>,
  options?: HonoSSEHandlerOptions
): (context: Context<E, P, I>) => Promise<Response> {
  return async (context): Promise<Response> => {
    const request = context.req.raw;
    const subscription = events.subscribe(request);

    return await Promise.resolve(
      createSSEResponse(subscription, {
        ...options,
        signal: context.req.raw.signal,
      })
    );
  };
}

/**
 * Creates a SSE handler with params
 *
 * @example
 * ```ts
 * import { Hono } from 'hono';
 * import { honoSSEHandlerWithParams } from '@upstash/realtime';
 *
 * const app = new Hono();
 *
 * app.get('/api/events/:channel', honoSSEHandlerWithParams(events));
 * ```
 */
export function honoSSEHandlerWithParams<
  TEventDefinitions extends EventDefinitions,
  // biome-ignore lint/suspicious/noExplicitAny: Defined as is in Context
  E extends Env = any,
  // biome-ignore lint/suspicious/noExplicitAny: Defined as is in Context
  P extends string = any,
  // biome-ignore lint/complexity/noBannedTypes: Defined as is in Context
  I extends Input = {},
>(
  events: EventsAPI<TEventDefinitions>,
  options?: HonoSSEHandlerOptions
): (context: Context<E, P, I>) => Promise<Response> {
  return async (context): Promise<Response> => {
    const request = context.req.raw;
    const subscription = events.subscribe({
      ...request,
      channel: context.req.param("channel"),
    });

    return await Promise.resolve(
      createSSEResponse(subscription, {
        ...options,
        signal: context.req.raw.signal,
      })
    );
  };
}
