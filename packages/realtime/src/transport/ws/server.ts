/**
 * WebSocket Server Transport
 *
 * This module will provide WebSocket server transport support.
 * Currently a placeholder for future implementation.
 *
 * @packageDocumentation
 */

import type {
  EventDefinitions,
  EventMessage,
  ServerTransport,
  ServerTransportOptions,
} from "../../types";

/**
 * WebSocket server transport options
 */
export type WSServerTransportOptions = ServerTransportOptions & {
  /** Ping interval in milliseconds */
  pingInterval?: number;
  /** Pong timeout in milliseconds */
  pongTimeout?: number;
};

/**
 * WebSocket Server Transport
 *
 * This class will handle WebSocket connections for real-time events.
 * Currently not implemented - use SSE transport instead.
 *
 * @example Future usage:
 * ```ts
 * import { WSServerTransport } from "@zap-studio/realtime/transport/ws/server";
 *
 * const transport = new WSServerTransport();
 * const response = transport.createResponse(subscription);
 * ```
 */
export class WSServerTransport<TEventDefinitions extends EventDefinitions>
  implements ServerTransport<TEventDefinitions>
{
  // biome-ignore lint/complexity/noUselessConstructor: to implement in the future
  constructor(_options?: WSServerTransportOptions) {
    // TODO: implement the constructor
  }

  createResponse(
    _subscription: AsyncGenerator<
      EventMessage<TEventDefinitions>,
      void,
      unknown
    >,
    _options?: ServerTransportOptions
  ): Response {
    // TODO: implement the createResponse method
    throw new Error(
      "WebSocket transport is not yet implemented. Use SSE transport instead."
    );
  }
}

/**
 * WebSocket upgrade handler
 *
 * It's used to upgrade an HTTP request to a WebSocket connection.
 */
export function upgradeHandler(
  _request: Request,
  subscription: AsyncGenerator<EventMessage, void, unknown>
): Response {
  // TODO: finish to implement the upgradeHandler method once WebSocket transport is implemented
  const transport = new WSServerTransport();
  return transport.createResponse(subscription);
}
