/** Extract only string event keys. */
export type EventKey<TEventMap extends object> = Extract<
  keyof TEventMap,
  string
>;

/** A function that handles events and takes a payload */
export type Handler<T> = (payload: T) => void | Promise<void>;

/** Logger surface for EventBus error reporting */
export interface ILogger<TEventMap extends object> {
  error: (
    message: string,
    err: unknown,
    context?: {
      event: EventKey<TEventMap>;
      errorEmitFailed?: unknown;
    }
  ) => void;
}

/** Error callback surface for EventBus error reporting */
export type ErrorReporter<TEventMap extends object> = (
  err: unknown,
  context: {
    event: EventKey<TEventMap>;
    errorEmitFailed?: unknown;
  }
) => void;

export interface EventBusOptions<
  TEventMap extends object = Record<string, unknown>,
> {
  /** Optional logger used when handlers throw. */
  logger?: ILogger<TEventMap>;
  /** Optional callback used when handlers throw. */
  onError?: ErrorReporter<TEventMap>;
  /** Optional event name used for error emissions. */
  errorEventType?: EventKey<TEventMap>;
  /** Optional payload factory for error event emissions. */
  errorEventPayload?: (
    err: unknown,
    source: EventKey<TEventMap>
  ) => TEventMap[EventKey<TEventMap>];
}
