import { WSClientTransport } from "../../transport/ws/client";
import type { EventDefinitions } from "../../types";
import {
  createTransportClientFactory,
  createVanillaClient,
  type VanillaClientOptions,
} from "../base/vanilla/create-transport-client";

/**
 * Vanilla JS WebSocket client options
 */
export type VanillaWSClientOptions<TEventDefinitions extends EventDefinitions> =
  VanillaClientOptions<TEventDefinitions> & {
    /**
     * Custom WebSocket protocols
     */
    protocols?: string | string[];
  };

/**
 * Vanilla JS WebSocket client wrapper
 *
 * Provides a simple API for connecting to WebSocket endpoints with type-safe
 * event handling and bidirectional communication.
 *
 * @example
 * ```ts
 * import { z } from "zod";
 * import { createVanillaWSClient } from "@zap-studio/realtime/client/vanilla/ws";
 *
 * const schemas = {
 *   message: z.object({ content: z.string(), sender: z.string() }),
 *   notification: z.object({ title: z.string(), body: z.string() }),
 * };
 *
 * const client = createVanillaWSClient("wss://example.com/ws", schemas);
 *
 * // Listen to specific events
 * const unsubscribe = client.on("message", (data) => {
 *   console.log("New message from", data.sender, ":", data.content);
 * });
 *
 * // Send messages to server
 * client.send("message", { content: "Hello!", sender: "Me" });
 *
 * // Subscribe to a channel
 * client.subscribe("chat:room-123");
 *
 * // Listen to all events
 * client.onAny((event, data) => {
 *   console.log(`Event ${event}:`, data);
 * });
 *
 * // Handle errors
 * client.onError((error) => {
 *   console.error("WebSocket error:", error);
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
export function createVanillaWSClient<
  TEventDefinitions extends EventDefinitions,
>(
  url: string,
  definitions: TEventDefinitions,
  options?: VanillaWSClientOptions<TEventDefinitions>
): WSClientTransport<TEventDefinitions> {
  return createVanillaClient(WSClientTransport, url, definitions, options);
}

/**
 * Create a factory for Vanilla JS WebSocket clients with shared configuration
 *
 * @example
 * ```ts
 * import { z } from "zod";
 * import { createWSClientFactory } from "@zap-studio/realtime/client/vanilla/ws";
 *
 * const schemas = {
 *   message: z.object({ content: z.string() }),
 * };
 *
 * const createClient = createWSClientFactory(schemas, {
 *   reconnect: { maxAttempts: 5 },
 * });
 *
 * // Create clients with different URLs
 * const client1 = createClient("wss://example.com/ws/channel1");
 * const client2 = createClient("wss://example.com/ws/channel2");
 *
 * // Send and receive messages
 * client1.send("message", { content: "Hello from channel 1!" });
 * client2.on("message", (msg) => console.log("Channel 2:", msg.content));
 * ```
 */
export function createWSClientFactory<
  TEventDefinitions extends EventDefinitions,
>(
  schemas: TEventDefinitions,
  defaultOptions?: VanillaWSClientOptions<TEventDefinitions>
): (
  url: string,
  options?: VanillaWSClientOptions<TEventDefinitions>
) => WSClientTransport<TEventDefinitions> {
  return createTransportClientFactory(
    WSClientTransport,
    schemas,
    defaultOptions
  );
}

/**
 * Create a WebSocket client with channel support
 *
 * This is a convenience function that creates a WebSocket client
 * and automatically subscribes to a channel.
 *
 * @example
 * ```ts
 * import { z } from "zod";
 * import { createChannelWSClient } from "@zap-studio/realtime/client/vanilla/ws";
 *
 * const schemas = {
 *   message: z.object({ content: z.string() }),
 * };
 *
 * // Connect and subscribe to a channel
 * const client = createChannelWSClient(
 *   "wss://example.com/ws",
 *   "chat:room-123",
 *   schemas
 * );
 *
 * client.on("message", (msg) => {
 *   console.log("Message in room:", msg.content);
 * });
 * ```
 */
export function createChannelWSClient<
  TEventDefinitions extends EventDefinitions,
>(
  url: string,
  channel: string,
  definitions: TEventDefinitions,
  options?: VanillaWSClientOptions<TEventDefinitions>
): WSClientTransport<TEventDefinitions> {
  const client = createVanillaWSClient(url, definitions, {
    ...options,
    autoConnect: false,
  });

  // Subscribe to channel after connection
  client.onConnectionChange((connected) => {
    if (connected) {
      client.subscribe(channel);
    }
  });

  const autoConnect = options?.autoConnect ?? true;
  if (autoConnect) {
    client.connect();
  }

  return client;
}
