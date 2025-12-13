import type { NextRequest, NextResponse } from "next/server";

import { createSSEResponse } from "../../transport/sse/server";
import type {
  EventDefinitions,
  EventsAPI,
  ServerTransportOptions,
} from "../../types";

/**
 * Options for Next.js SSE route handler
 */
export type NextSSERouteOptions = ServerTransportOptions & {
  /**
   * Heartbeat interval in milliseconds
   * @default 30000
   */
  heartbeatInterval?: number;
};

/**
 * Create a Next.js App Router SSE route handler
 *
 * @example
 * ```ts
 * // app/api/events/route.ts
 * import { events } from "@/lib/events";
 * import { nextSSERoute } from "@zap-studio/realtime/adapters/next/sse";
 *
 * export const GET = nextSSERoute<typeof events>(() => events.subscribe());
 * ```
 */
export function nextSSERoute<TEventDefinitions extends EventDefinitions>(
  events: EventsAPI<TEventDefinitions>,
  options?: NextSSERouteOptions
): (request: Request | NextRequest) => Promise<Response | NextResponse> {
  return async (
    request: Request | NextRequest
  ): Promise<Response | NextResponse> => {
    const subscription = events.subscribe(request);

    return await Promise.resolve(
      createSSEResponse(subscription, {
        ...options,
        signal: request.signal,
      })
    );
  };
}

/**
 * Create a dynamic Next.js SSE route handler with params
 *
 * @example
 * ```ts
 * // app/api/events/[channel]/route.ts
 * import { events } from "@/lib/events";
 * import { nextSSERouteWithParams } from "@zap-studio/realtime/adapters/next/sse";
 *
 * export const GET = nextSSERouteWithParams(
 *   (request, { params }) =>
 *     events.subscribe({ channel: params.channel })
 * );
 * ```
 */
export function nextSSERouteWithParams<
  TEventDefinitions extends EventDefinitions,
  TParams extends Record<string, string | string[]>,
>(
  events: EventsAPI<TEventDefinitions>,
  options?: NextSSERouteOptions
): (
  request: Request | NextRequest,
  context: { params: Promise<TParams> }
) => Promise<Response | NextResponse> {
  return async (
    request: Request | NextRequest,
    context: { params: Promise<TParams> }
  ): Promise<Response | NextResponse> => {
    const params = await context.params;
    const channel = Array.isArray(params.channel)
      ? params.channel[0]
      : params.channel;
    const subscription = events.subscribe({ channel });

    return createSSEResponse(subscription, {
      ...options,
      signal: request.signal,
    });
  };
}
