import type {
  EventDefinitions,
  EventMessage,
  SSEServerTransport as ISSEServerTransport,
  ServerSSETransportOptions,
} from "../../types";
import { BaseServerTransport } from "../base/server";

/**
 * Default HTTP headers for Server-Sent Events (SSE) responses.
 *
 * - `Content-Type: text/event-stream`
 *   Informs the client that the response is an SSE stream.
 * - `Cache-Control: no-cache, no-transform`
 *   Prevents caching and transformation by proxies or browsers, ensuring real-time delivery.
 * - `Connection: keep-alive`
 *   Keeps the HTTP connection open for continuous event streaming.
 * - `X-Accel-Buffering: no`
 *   Disables response buffering in NGINX and some reverse proxies, so events are sent immediately.
 */
const SSE_HEADERS: Record<string, string> = {
  "Content-Type": "text/event-stream",
  "Cache-Control": "no-cache, no-transform",
  Connection: "keep-alive",
  "X-Accel-Buffering": "no",
};

/**
 * Format an event message as SSE data
 */
function formatSSEMessage<TEventDefinitions extends EventDefinitions>(
  message: EventMessage<TEventDefinitions>
): string {
  const lines: string[] = [];

  lines.push(`id: ${message.id}`);
  lines.push(`event: ${String(message.event)}`);

  if (message.retry !== undefined) {
    lines.push(`retry: ${message.retry}`);
  }

  // Serialize data as JSON and handle multi-line data
  const dataString = JSON.stringify({
    data: message.data,
    timestamp: message.timestamp,
  });
  lines.push(`data: ${dataString}`);

  return `${lines.join("\n")}\n\n`;
}

/**
 * Format a heartbeat/keep-alive comment
 */
function formatHeartbeat(): string {
  return `: heartbeat ${Date.now()}\n\n`;
}

/**
 * SSE server transport options
 */
export interface SSEServerTransportOptions {
  /** Heartbeat interval in milliseconds (0 to disable) */
  heartbeatInterval?: number;
}

/**
 * SSE Server Transport
 *
 * Creates streaming responses from event subscriptions using Server-Sent Events.
 *
 * @example
 * ```ts
 * import { SSEServerTransport } from "@zap-studio/realtime/transport/sse/server";
 *
 * const transport = new SSEServerTransport({
 *   heartbeatInterval: 30000,
 * });
 *
 * // In your request handler
 * const response = transport.createResponse(events.subscribe());
 * ```
 */
export class SSEServerTransport<TEventDefinitions extends EventDefinitions>
  extends BaseServerTransport<TEventDefinitions>
  implements ISSEServerTransport<TEventDefinitions>
{
  constructor(options?: SSEServerTransportOptions) {
    super({ keepAliveInterval: options?.heartbeatInterval });
  }

  /**
   * Create an SSE Response from an async generator of events
   */
  createResponse(
    subscription: AsyncGenerator<
      EventMessage<TEventDefinitions>,
      void,
      unknown
    >,
    options?: ServerSSETransportOptions
  ): Response {
    const heartbeatInterval =
      options?.heartbeatInterval ?? this.keepAliveInterval;
    const signal = options?.signal;

    let heartbeatTimer: ReturnType<typeof setInterval> | null = null;
    let isClosed = false;

    const encoder = new TextEncoder();

    const enqueue = (
      controller: ReadableStreamDefaultController,
      text: string
    ) => {
      controller.enqueue(encoder.encode(text));
    };

    const cleanup = (
      controller?: ReadableStreamDefaultController,
      closeStream = true
    ) => {
      if (isClosed) {
        return;
      }
      isClosed = true;

      if (heartbeatTimer) {
        clearInterval(heartbeatTimer);
        heartbeatTimer = null;
      }

      if (closeStream && controller) {
        try {
          controller.close();
        } catch {
          /* already closed */
        }
      }
    };

    const startHeartbeat = (controller: ReadableStreamDefaultController) => {
      if (heartbeatInterval <= 0) {
        return;
      }

      heartbeatTimer = setInterval(() => {
        if (!isClosed) {
          try {
            enqueue(controller, formatHeartbeat());
          } catch {
            /* stream closed */
          }
        }
      }, heartbeatInterval);
    };

    const stream = new ReadableStream({
      async start(controller) {
        startHeartbeat(controller);

        if (signal) {
          signal.addEventListener("abort", () => cleanup(controller));
        }

        try {
          for await (const event of subscription) {
            if (isClosed || signal?.aborted) {
              break;
            }
            enqueue(controller, formatSSEMessage(event));
          }
        } catch (error) {
          if (!isClosed) {
            controller.error(error);
          }
        } finally {
          cleanup(controller);
        }
      },

      cancel() {
        cleanup(undefined, false);
      },
    });

    const headers = new Headers(SSE_HEADERS);
    if (options?.headers) {
      for (const [key, value] of Object.entries(options.headers)) {
        headers.set(key, value);
      }
    }

    return new Response(stream, {
      status: 200,
      headers,
    });
  }
}

/**
 * Convenience function to create an SSE response directly
 */
export function createSSEResponse<TEventDefinitions extends EventDefinitions>(
  subscription: AsyncGenerator<EventMessage<TEventDefinitions>, void, unknown>,
  options?: ServerSSETransportOptions & { heartbeatInterval?: number }
): Response {
  const transport = new SSEServerTransport<TEventDefinitions>({
    heartbeatInterval: options?.heartbeatInterval,
  });
  return transport.createResponse(subscription, options);
}
