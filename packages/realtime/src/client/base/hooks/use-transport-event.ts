import { useCallback, useEffect, useState } from "react";
import type {
  EventDefinitions,
  EventKeys,
  InferEventTypes,
} from "../../../types";
import type { UseTransportClientReturn } from "./use-transport-client";

/**
 * Base return type for transport event hooks (receive-only)
 */
export interface UseTransportEventReturn<
  TEventDefinitions extends EventDefinitions,
  TEvent extends EventKeys<TEventDefinitions>,
> {
  /** Latest event data received */
  data: InferEventTypes<TEventDefinitions>[TEvent] | null;
  /** Whether currently connected */
  connected: boolean;
  /** Last error if any */
  error: Error | null;
}

/**
 * Extended return type with send capability (for bidirectional transports)
 */
export type UseTransportEventReturnWithSend<
  TEventDefinitions extends EventDefinitions,
  TEvent extends EventKeys<TEventDefinitions>,
> = UseTransportEventReturn<TEventDefinitions, TEvent> & {
  /** Send data for this event */
  send: (data: InferEventTypes<TEventDefinitions>[TEvent]) => void;
};

/**
 * Core hook for subscribing to a single transport event
 *
 * This hook provides the shared logic for single event subscription:
 * - Tracks latest event data in state
 * - Passes through connection and error state
 *
 * @internal
 */
export function useTransportEvent<
  TEventDefinitions extends EventDefinitions,
  TEvent extends EventKeys<TEventDefinitions>,
>(
  event: TEvent,
  transportClient: UseTransportClientReturn<TEventDefinitions>
): UseTransportEventReturn<TEventDefinitions, TEvent> {
  const [data, setData] = useState<
    InferEventTypes<TEventDefinitions>[TEvent] | null
  >(null);

  const { on, connected, error } = transportClient;

  useEffect(() => {
    const unsubscribe = on(event, (eventData) => {
      setData(eventData);
    });
    return unsubscribe;
  }, [on, event]);

  return { data, connected, error };
}

/**
 * Core hook for subscribing to a single transport event with send capability
 *
 * Extends useTransportEvent with a send function for bidirectional transports.
 *
 * @internal
 */
export function useTransportEventWithSend<
  TEventDefinitions extends EventDefinitions,
  TEvent extends EventKeys<TEventDefinitions>,
>(
  event: TEvent,
  transportClient: UseTransportClientReturn<TEventDefinitions> & {
    send: <E extends EventKeys<TEventDefinitions>>(
      event: E,
      data: InferEventTypes<TEventDefinitions>[E]
    ) => void;
  }
): UseTransportEventReturnWithSend<TEventDefinitions, TEvent> {
  const base = useTransportEvent(event, transportClient);
  const { send: transportSend } = transportClient;

  const send = useCallback(
    (eventData: InferEventTypes<TEventDefinitions>[TEvent]) => {
      transportSend(event, eventData);
    },
    [transportSend, event]
  );

  return { ...base, send };
}
