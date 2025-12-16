import type {
  ClientTransportOptions,
  EventDefinitions,
  EventKeys,
} from "../../types";
import { BaseClientTransport } from "../base/client";

/**
 * Parsed SSE event data
 */
type ParsedEventData = {
  data: unknown;
  timestamp: number;
};

/**
 * SSE Client Transport
 *
 * Wraps EventSource for type-safe event handling with schema validation.
 *
 * @example
 * ```ts
 * import { SSEClientTransport } from "@zap-studio/realtime/transport/sse/client";
 * import { z } from "zod";
 *
 * const definitions = {
 *   message: z.object({ content: z.string() }),
 *   notification: z.object({ title: z.string() }),
 * };
 *
 * const client = new SSEClientTransport("https://example.com/events", {
 *   definitions,
 * });
 *
 * client.on("message", (data) => {
 *   console.log("Message:", data.content);
 * });
 *
 * client.connect();
 * ```
 */
export class SSEClientTransport<
  TEventDefinitions extends EventDefinitions,
> extends BaseClientTransport<TEventDefinitions> {
  private eventSource: EventSource | null = null;

  constructor(url: string, options: ClientTransportOptions<TEventDefinitions>) {
    super(url, options);
  }

  /**
   * Connect to the SSE server
   */
  connect(): void {
    if (!this.eventSource) {
      this.createEventSource();
    }
  }

  /**
   * Close the underlying EventSource connection
   */
  protected closeConnection(): void {
    this.eventSource?.close();
    this.eventSource = null;
  }

  /**
   * Register event listener on EventSource when first handler is added
   */
  protected onFirstHandler(event: EventKeys<TEventDefinitions>): void {
    this.registerEventListener(event);
  }

  private createEventSource(): void {
    this.eventSource = new EventSource(this.url);

    this.eventSource.onopen = () => {
      this.onConnectionEstablished();
    };

    this.eventSource.onerror = () => {
      this.onConnectionLost();

      if (this.eventSource?.readyState === EventSource.CLOSED) {
        this.eventSource = null;
        this.handleReconnect(() => this.createEventSource());
      } else {
        this.notifyError(new Error("SSE connection error"));
      }
    };

    // Re-register all event listeners
    for (const event of this.eventHandlers.keys()) {
      this.registerEventListener(event);
    }
  }

  private registerEventListener(event: EventKeys<TEventDefinitions>): void {
    if (!this.eventSource) {
      return;
    }

    this.eventSource.addEventListener(event, (e) => {
      this.handleEvent(event, e as MessageEvent<string>);
    });
  }

  private async handleEvent(
    event: EventKeys<TEventDefinitions>,
    e: MessageEvent<string>
  ): Promise<void> {
    try {
      const parsed: ParsedEventData = JSON.parse(e.data);
      const data = await this.validateEventData(event, parsed.data);
      this.dispatchEvent(event, data);
    } catch (error) {
      this.notifyError(
        error instanceof Error ? error : new Error(String(error))
      );
    }
  }
}
