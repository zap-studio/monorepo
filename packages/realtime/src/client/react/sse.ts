import { useMemo } from "react";
import { SSEClientTransport } from "../../transport/sse/client";
import type {
  ClientTransportOptions,
  EventDefinitions,
  EventKeys,
  InferEventTypes,
} from "../../types";
import {
  type UseTransportClientOptions,
  type UseTransportClientReturn,
  useTransportClient,
} from "../base/hooks/use-transport-client";
import { useTransportEvent } from "../base/hooks/use-transport-event";
import { useTransportEventHistory } from "../base/hooks/use-transport-event-history";

/**
 * useSSE hook options
 */
export type UseSSEOptions<TEventDefinitions extends EventDefinitions> = Omit<
  ClientTransportOptions<TEventDefinitions>,
  "definitions"
> & {
  /**
   * Whether to connect on mount
   * @default true
   */
  enabled?: boolean;
};

/**
 * useSSE hook return type
 */
export type UseSSEReturn<TEventDefinitions extends EventDefinitions> =
  UseTransportClientReturn<TEventDefinitions>;

/**
 * React hook for subscribing to SSE events
 *
 * @example
 * ```tsx
 * import { z } from "zod";
 * import { useSSE } from "@zap-studio/realtime/client/react/sse";
 *
 * const MyEvents = {
 *   message: z.object({ title: z.string(), body: z.string() }),
 *   notification: z.object({ type: z.string(), text: z.string() }),
 * };
 *
 * function ChatComponent() {
 *   const { on, connected, error } = useSSE("/api/events", MyEvents);
 *
 *   useEffect(() => {
 *     const unsubscribe = on("message", (msg) => {
 *       console.log("New message:", msg.title);
 *     });
 *     return unsubscribe;
 *   }, [on]);
 *
 *   if (error) return <div>Error: {error.message}</div>;
 *   if (!connected) return <div>Connecting...</div>;
 *
 *   return <div>Connected and listening...</div>;
 * }
 * ```
 */
export function useSSE<TEventDefinitions extends EventDefinitions>(
  url: string,
  definitions: TEventDefinitions,
  options?: UseSSEOptions<TEventDefinitions>
): UseSSEReturn<TEventDefinitions> {
  // Memoize options to prevent unnecessary re-renders
  const memoizedOptions = useMemo(() => options, [options]);

  const createClient = useMemo(
    () =>
      (
        _url: string,
        _definitions: TEventDefinitions,
        opts: UseTransportClientOptions | undefined
      ) =>
        new SSEClientTransport(_url, {
          definitions: _definitions,
          validate: opts?.validate,
          reconnect: opts?.reconnect,
        }),
    []
  );

  const { connected, on, onAny, error, connect, disconnect } =
    useTransportClient(createClient, url, definitions, memoizedOptions);

  return {
    connected,
    on,
    onAny,
    error,
    connect,
    disconnect,
  };
}

/**
 * React hook for subscribing to a specific SSE event
 *
 * @example
 * ```tsx
 * import { z } from "zod";
 * import { useSSEEvent } from "@zap-studio/realtime/client/react/sse";
 *
 * const MessageSchema = z.object({ title: z.string(), body: z.string() });
 *
 * function MessageComponent() {
 *   const { data, connected } = useSSEEvent("/api/events", "message", { message: MessageSchema });
 *
 *   if (!data) return <div>Waiting for messages...</div>;
 *
 *   return (
 *     <div>
 *       <h1>{data.title}</h1>
 *       <p>{data.body}</p>
 *     </div>
 *   );
 * }
 * ```
 */
export function useSSEEvent<
  TEventDefinitions extends EventDefinitions,
  TEvent extends EventKeys<TEventDefinitions>,
>(
  url: string,
  event: TEvent,
  schemas: TEventDefinitions,
  options?: UseSSEOptions<TEventDefinitions>
): {
  data: InferEventTypes<TEventDefinitions>[TEvent] | null;
  connected: boolean;
  error: Error | null;
} {
  const sseClient = useSSE(url, schemas, options);
  return useTransportEvent(event, sseClient);
}

/**
 * React hook for collecting SSE events into an array
 *
 * @example
 * ```tsx
 * import { z } from "zod";
 * import { useSSEEventHistory } from "@zap-studio/realtime/client/react/sse";
 *
 * const MessageSchema = z.object({ title: z.string(), body: z.string() });
 *
 * function MessageListComponent() {
 *   const { events, connected, clear } = useSSEEventHistory("/api/events", "message", { message: MessageSchema }, {
 *     maxEvents: 100,
 *   });
 *
 *   return (
 *     <div>
 *       <button onClick={clear}>Clear</button>
 *       {events.map((msg, i) => (
 *         <div key={i}>
 *           <h1>{msg.title}</h1>
 *           <p>{msg.body}</p>
 *         </div>
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */
export function useSSEEventHistory<
  TEventDefinitions extends EventDefinitions,
  TEvent extends EventKeys<TEventDefinitions>,
>(
  url: string,
  event: TEvent,
  schemas: TEventDefinitions,
  options?: UseSSEOptions<TEventDefinitions> & {
    /**
     * Maximum number of events to keep
     * @default 100
     */
    maxEvents?: number;
  }
): {
  events: InferEventTypes<TEventDefinitions>[TEvent][];
  connected: boolean;
  error: Error | null;
  clear: () => void;
} {
  const maxEvents = options?.maxEvents ?? 100;
  const sseClient = useSSE(url, schemas, options);
  return useTransportEventHistory(event, sseClient, maxEvents);
}
