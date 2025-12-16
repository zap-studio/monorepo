import { SSEClientTransport } from "../../transport/sse/client";
import type { ClientTransportOptions, EventDefinitions } from "../../types";

/**
 * Vanilla JS SSE client options
 */
export type VanillaSSEClientOptions<
  TEventDefinitions extends EventDefinitions,
> = Omit<ClientTransportOptions<TEventDefinitions>, "definitions"> & {
  /**
   * Whether to auto-connect on creation
   * @default true
   */
  autoConnect?: boolean;
};

/**
 * Vanilla JS SSE client wrapper
 *
 * Provides a simple API for connecting to SSE endpoints with type-safe event handling.
 *
 * @example
 * ```ts
 * import { z } from "zod";
 * import { createVanillaSSEClient } from "@zap-studio/realtime/client/vanilla/sse";
 *
 * const schemas = {
 *   message: z.object({ title: z.string(), body: z.string() }),
 *   notification: z.object({ type: z.string(), text: z.string() }),
 * };
 *
 * const client = createVanillaSSEClient("/api/events", schemas);
 *
 * // Listen to specific events
 * const unsubscribe = client.on("message", (data) => {
 *   console.log("New message:", data.title);
 * });
 *
 * // Listen to all events
 * client.onAny((event, data) => {
 *   console.log(`Event ${event}:`, data);
 * });
 *
 * // Handle errors
 * client.onError((error) => {
 *   console.error("SSE error:", error);
 * });
 *
 * // Handle connection changes
 * client.onConnectionChange((connected) => {
 *   console.log("Connected:", connected);
 * });
 *
 * // Cleanup
 * unsubscribe();
 * client.disconnect();
 * ```
 */
export function createVanillaSSEClient<
  TEventDefinitions extends EventDefinitions,
>(
  url: string,
  definitions: TEventDefinitions,
  options?: VanillaSSEClientOptions<TEventDefinitions>
): SSEClientTransport<TEventDefinitions> & {
  /** Manually connect if autoConnect was false */
  connect: () => void;
  /** Disconnect and cleanup */
  disconnect: () => void;
} {
  const client = new SSEClientTransport(url, {
    definitions,
    validate: options?.validate,
    reconnect: options?.reconnect,
  });

  const autoConnect = options?.autoConnect ?? true;
  if (autoConnect) {
    client.connect();
  }

  return client;
}

/**
 * Create a factory for Vanilla JS SSE clients with shared configuration
 *
 * @example
 * ```ts
 * import { z } from "zod";
 * import { createSSEClientFactory } from "@zap-studio/realtime/client/vanilla/sse";
 *
 * const schemas = {
 *   message: z.object({ title: z.string(), body: z.string() }),
 * };
 *
 * const createClient = createSSEClientFactory(schemas, {
 *   reconnect: { maxAttempts: 5 },
 * });
 *
 * // Create clients with different URLs
 * const client1 = createClient("/api/events/channel1");
 * const client2 = createClient("/api/events/channel2");
 * ```
 */
export function createSSEClientFactory<
  TEventDefinitions extends EventDefinitions,
>(
  schemas: TEventDefinitions,
  defaultOptions?: VanillaSSEClientOptions<TEventDefinitions>
): (
  url: string,
  options?: VanillaSSEClientOptions<TEventDefinitions>
) => SSEClientTransport<TEventDefinitions> {
  return (url: string, options?: VanillaSSEClientOptions<TEventDefinitions>) =>
    createVanillaSSEClient(url, schemas, {
      ...defaultOptions,
      ...options,
    });
}
