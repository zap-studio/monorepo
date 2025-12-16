import type {
  EventDefinitions,
  EventKeys,
  EventMessage,
  InferEventTypes,
} from "../../types";

/**
 * Base server transport options
 */
export type BaseServerTransportOptions = {
  /** Keep-alive interval in milliseconds (0 to disable) */
  keepAliveInterval?: number;
};

/**
 * Generate a unique message/connection ID
 */
export function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Create an event message with all required fields
 */
export function createEventMessage<
  TEventDefinitions extends EventDefinitions,
  TEvent extends EventKeys<TEventDefinitions>,
>(
  event: TEvent,
  data: InferEventTypes<TEventDefinitions>[TEvent],
  options?: { id?: string; retry?: number }
): EventMessage<TEventDefinitions, TEvent> {
  return {
    id: options?.id ?? generateId(),
    event,
    data,
    timestamp: Date.now(),
    retry: options?.retry,
  };
}

/**
 * Base Server Transport
 *
 * Abstract base class for server transports that provides common functionality
 * for event formatting and keep-alive management.
 *
 * Subclasses must implement transport-specific response creation.
 */
export abstract class BaseServerTransport<
  TEventDefinitions extends EventDefinitions,
> {
  protected readonly keepAliveInterval: number;

  constructor(options?: BaseServerTransportOptions) {
    this.keepAliveInterval = options?.keepAliveInterval ?? 30_000;
  }

  /**
   * Get the keep-alive interval
   */
  getKeepAliveInterval(): number {
    return this.keepAliveInterval;
  }

  /**
   * Create an event message
   */
  protected createMessage<TEvent extends EventKeys<TEventDefinitions>>(
    event: TEvent,
    data: InferEventTypes<TEventDefinitions>[TEvent],
    options?: { id?: string; retry?: number }
  ): EventMessage<TEventDefinitions, TEvent> {
    return createEventMessage(event, data, options);
  }
}
