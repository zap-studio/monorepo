import type { ILogger } from "@zap-studio/logging";

/** Extract only string event keys. */
export type EventKey<TEventMap extends object> = Extract<
  keyof TEventMap,
  string
>;

/** A function that handles events and takes a payload */
export type Handler<T> = (payload: T) => void | Promise<void>;

/** Logger surface for EventBus error reporting. */
export type EventBusLogger<TEventMap extends object> = ILogger<
  unknown,
  {
    event: EventKey<TEventMap>;
  }
>;

/**
 * A type representing options of EventBus.
 */
export interface EventBusOptions<
  TEventMap extends object = Record<string, unknown>,
> {
  /** Optional logger used when handlers throw. */
  logger?: EventBusLogger<TEventMap>;
}

/**
 * A type representing all event handlers.
 */
export type EventHandlers<TEventMap extends object> = Partial<{
  [K in EventKey<TEventMap>]: Handler<TEventMap[K]>[];
}>;
