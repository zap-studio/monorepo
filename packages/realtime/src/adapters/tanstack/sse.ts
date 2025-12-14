import { createSSEResponse } from "../../transport/sse/server";
import type {
  EventDefinitions,
  EventsAPI,
  ServerTransportOptions,
} from "../../types";

/**
 * Options for TanStack Start SSE handler
 */
export type TanStackSSEHandlerOptions = ServerTransportOptions & {
  /**
   * Heartbeat interval in milliseconds
   * @default 30000
   */
  heartbeatInterval?: number;
};

/**
 * Create a TanStack Start SSE server function
 *
 * @example
 * ```ts
 * // routes/api/events.ts
 * import { createFileRoute } from "@tanstack/react-router";
 * import { events } from "@/lib/events";
 * import { tanstackSSEHandler } from "@zap-studio/realtime/adapters/tanstack/sse";
 *
 * export const Route = createFileRoute("/api/events")({
 *  server: {
 *    handlers: {
 *      GET: tanstackSSEHandler(events),
 *    },
 *  },
 * });
 * ```
 */
export function tanstackStartSSEHandler<
  TEventDefinitions extends EventDefinitions,
>(
  events: EventsAPI<TEventDefinitions>,
  options?: TanStackSSEHandlerOptions
): ({ request }: { request: Request }) => Promise<Response> {
  return async ({ request }: { request: Request }): Promise<Response> => {
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
 * Create a TanStack Start SSE server function with params
 *
 * @example
 * ```ts
 * // routes/api/events/$channel.ts
 * import { createFileRoute } from "@tanstack/react-router";
 * import { events } from "@/lib/events";
 * import { tanstackSSEHandlerWithParams } from "@zap-studio/realtime/adapters/tanstack/sse";
 *
 * export const Route = createFileRoute("/api/events/$channel")({
 *   GET: tanstackSSEHandlerWithParams(({ request,params }) => {
 *     return events.subscribe({ channel: params.channel });
 *   }),
 * });
 * ```
 */
export function tanstackSSEHandlerWithParams<
  TEventDefinitions extends EventDefinitions,
  TParams extends Record<string, string>,
>(
  events: EventsAPI<TEventDefinitions>,
  options?: TanStackSSEHandlerOptions
): ({
  request,
  params,
}: {
  request: Request;
  params: TParams;
}) => Promise<Response> {
  return async ({
    request,
    params,
  }: {
    request: Request;
    params: TParams;
  }): Promise<Response> => {
    const subscription = events.subscribe({
      ...request,
      channel: params.channel,
    });

    return await Promise.resolve(
      createSSEResponse(subscription, {
        ...options,
        signal: request.signal,
      })
    );
  };
}
