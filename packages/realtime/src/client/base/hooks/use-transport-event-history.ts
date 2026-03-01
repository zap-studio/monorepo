import { useCallback, useEffect, useState } from "react";
import type {
  EventDefinitions,
  EventKeys,
  InferEventTypes,
} from "../../../types";
import type { UseTransportClientReturn } from "./use-transport-client";

/**
 * Base return type for transport event history hooks (receive-only)
 */
export interface UseTransportEventHistoryReturn<
  TEventDefinitions extends EventDefinitions,
  TEvent extends EventKeys<TEventDefinitions>,
> {
  /** Clear the event history */
  clear: () => void;
  /** Whether currently connected */
  connected: boolean;
  /** Last error if any */
  error: Error | null;
  /** Array of received events */
  events: InferEventTypes<TEventDefinitions>[TEvent][];
}

/**
 * Extended return type with send capability (for bidirectional transports)
 */
export type UseTransportEventHistoryReturnWithSend<
  TEventDefinitions extends EventDefinitions,
  TEvent extends EventKeys<TEventDefinitions>,
> = UseTransportEventHistoryReturn<TEventDefinitions, TEvent> & {
  /** Send data for this event */
  send: (data: InferEventTypes<TEventDefinitions>[TEvent]) => void;
};

/**
 * Core hook for collecting transport events into an array
 *
 * This hook provides the shared logic for event history:
 * - Collects events into an array
 * - Respects maxEvents limit
 * - Provides clear function
 *
 * @internal
 */
export function useTransportEventHistory<
  TEventDefinitions extends EventDefinitions,
  TEvent extends EventKeys<TEventDefinitions>,
>(
  event: TEvent,
  transportClient: UseTransportClientReturn<TEventDefinitions>,
  maxEvents = 100
): UseTransportEventHistoryReturn<TEventDefinitions, TEvent> {
  const [events, setEvents] = useState<
    InferEventTypes<TEventDefinitions>[TEvent][]
  >([]);

  const { on, connected, error } = transportClient;

  useEffect(() => {
    const unsubscribe = on(event, (eventData) => {
      setEvents((prev) => {
        const next = [...prev, eventData];
        if (next.length > maxEvents) {
          return next.slice(-maxEvents);
        }
        return next;
      });
    });
    return unsubscribe;
  }, [on, event, maxEvents]);

  const clear = useCallback(() => {
    setEvents([]);
  }, []);

  return { events, connected, error, clear };
}

/**
 * Core hook for collecting transport events with send capability
 *
 * Extends useTransportEventHistory with a send function for bidirectional transports.
 *
 * @internal
 */
export function useTransportEventHistoryWithSend<
  TEventDefinitions extends EventDefinitions,
  TEvent extends EventKeys<TEventDefinitions>,
>(
  event: TEvent,
  transportClient: UseTransportClientReturn<TEventDefinitions> & {
    send: <E extends EventKeys<TEventDefinitions>>(
      event: E,
      data: InferEventTypes<TEventDefinitions>[E]
    ) => void;
  },
  maxEvents = 100
): UseTransportEventHistoryReturnWithSend<TEventDefinitions, TEvent> {
  const base = useTransportEventHistory(event, transportClient, maxEvents);
  const { send: transportSend } = transportClient;

  const send = useCallback(
    (eventData: InferEventTypes<TEventDefinitions>[TEvent]) => {
      transportSend(event, eventData);
    },
    [transportSend, event]
  );

  return { ...base, send };
}
