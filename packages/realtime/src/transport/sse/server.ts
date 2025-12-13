import type {
  EventMessage,
  EventSchemaMap,
  ServerTransport,
  ServerTransportOptions,
} from "../../types";

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
export function formatSSEMessage<TSchema extends EventSchemaMap>(
  message: EventMessage<TSchema>
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
export function formatHeartbeat(): string {
  return `: heartbeat ${Date.now()}\n\n`;
}

/**
 * SSE Server Transport
 *
 * Creates streaming responses from event subscriptions using Server-Sent Events
 */
export class SSEServerTransport<TSchemas extends EventSchemaMap>
  implements ServerTransport<TSchemas>
{
  private readonly defaultHeartbeatInterval: number;

  constructor(options?: { heartbeatInterval?: number }) {
    this.defaultHeartbeatInterval = options?.heartbeatInterval ?? 30_000;
  }

  /**
   * Create an SSE Response from an async generator of events
   */
  createResponse(
    subscription: AsyncGenerator<EventMessage<TSchemas>, void, unknown>,
    options?: ServerTransportOptions
  ): Response {
    const heartbeatInterval =
      options?.heartbeatInterval ?? this.defaultHeartbeatInterval;
    const signal = options?.signal;

    let heartbeatTimer: ReturnType<typeof setInterval> | null = null;
    let isClosed = false;

    const stream = new ReadableStream({
      async start(controller) {
        // Set up heartbeat if enabled
        if (heartbeatInterval > 0) {
          heartbeatTimer = setInterval(() => {
            if (!isClosed) {
              try {
                controller.enqueue(new TextEncoder().encode(formatHeartbeat()));
              } catch {
                // Stream may be closed
              }
            }
          }, heartbeatInterval);
        }

        // Handle abort signal
        if (signal) {
          signal.addEventListener("abort", () => {
            isClosed = true;
            if (heartbeatTimer) {
              clearInterval(heartbeatTimer);
            }
            try {
              controller.close();
            } catch {
              // Already closed
            }
          });
        }

        try {
          for await (const event of subscription) {
            if (isClosed || signal?.aborted) {
              break;
            }

            const sseData = formatSSEMessage(event);
            controller.enqueue(new TextEncoder().encode(sseData));
          }
        } catch (error) {
          if (!isClosed) {
            controller.error(error);
          }
        } finally {
          isClosed = true;
          if (heartbeatTimer) {
            clearInterval(heartbeatTimer);
          }
          try {
            controller.close();
          } catch {
            // Already closed
          }
        }
      },

      cancel() {
        isClosed = true;
        if (heartbeatTimer) {
          clearInterval(heartbeatTimer);
        }
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
export function createSSEResponse<TSchemas extends EventSchemaMap>(
  subscription: AsyncGenerator<EventMessage<TSchemas>, void, unknown>,
  options?: ServerTransportOptions & { heartbeatInterval?: number }
): Response {
  const transport = new SSEServerTransport<TSchemas>({
    heartbeatInterval: options?.heartbeatInterval,
  });
  return transport.createResponse(subscription, options);
}
