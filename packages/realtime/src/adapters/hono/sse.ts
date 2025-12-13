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
}; /**
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
 *
 * // With channel from URL
 * app.get('/api/events/:channel', (c) => {
 *   const channel = c.req.param('channel')
 *   return honoSSEHandler(events, { channel })
 * })
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
