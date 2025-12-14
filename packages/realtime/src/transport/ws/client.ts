/**
 * WebSocket Client Transport
 *
 * This module will provide WebSocket client transport support.
 * Currently a placeholder for future implementation.
 *
 * @packageDocumentation
 */

import type {
  ClientTransport,
  ClientTransportOptions,
  EventDefinitions,
  EventKeys,
  InferEventTypes,
} from "../../types";

/**
 * WebSocket client transport options
 */
export type WSClientTransportOptions<
  TEventDefinitions extends EventDefinitions,
> = ClientTransportOptions<TEventDefinitions> & {
  /** Custom protocols for WebSocket connection */
  protocols?: string | string[];
};

/**
 * WebSocket Client Transport
 *
 * This class will handle WebSocket connections for real-time events.
 * Currently not implemented - use SSE client instead.
 *
 * @example Future usage:
 * ```ts
 * import { WSClientTransport } from "@zap-studio/realtime/transport/ws/client";
 *
 * const client = new WSClientTransport("wss://example.com/events", {
 *   definitions: MyEvents,
 * });
 * client.connect();
 * client.on("message", (data) => console.log(data));
 * ```
 */
export class WSClientTransport<TEventDefinitions extends EventDefinitions>
  implements ClientTransport<TEventDefinitions>
{
  // @ts-expect-error need to fix this later
  private readonly url: string;
  // @ts-expect-error need to fix this later
  private readonly options: WSClientTransportOptions<TEventDefinitions>;

  constructor(
    url: string,
    options: WSClientTransportOptions<TEventDefinitions>
  ) {
    this.url = url;
    this.options = options;

    // TODO: Implement WebSocket transport
  }

  get connected(): boolean {
    return false;
  }

  connect(): void {
    throw new Error(
      "WebSocket transport is not yet implemented. Use SSE client instead."
    );
  }

  disconnect(): void {
    throw new Error(
      "WebSocket transport is not yet implemented. Use SSE client instead."
    );
  }

  on<TEvent extends EventKeys<TEventDefinitions>>(
    _event: TEvent,
    _handler: (data: InferEventTypes<TEventDefinitions>[TEvent]) => void
  ): () => void {
    throw new Error(
      "WebSocket transport is not yet implemented. Use SSE client instead."
    );
  }

  onAny(
    _handler: <TEvent extends EventKeys<TEventDefinitions>>(
      event: TEvent,
      data: InferEventTypes<TEventDefinitions>[TEvent]
    ) => void
  ): () => void {
    throw new Error(
      "WebSocket transport is not yet implemented. Use SSE client instead."
    );
  }

  onError(_handler: (error: Error) => void): () => void {
    throw new Error(
      "WebSocket transport is not yet implemented. Use SSE client instead."
    );
  }

  onConnectionChange(_handler: (connected: boolean) => void): () => void {
    throw new Error(
      "WebSocket transport is not yet implemented. Use SSE client instead."
    );
  }

  /**
   * Send a message to the server (WebSocket-specific feature)
   */
  send<TEvent extends EventKeys<TEventDefinitions>>(
    _event: TEvent,
    _data: InferEventTypes<TEventDefinitions>[TEvent]
  ): void {
    throw new Error(
      "WebSocket transport is not yet implemented. Use SSE client instead."
    );
  }
}
