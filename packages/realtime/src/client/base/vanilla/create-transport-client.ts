import type { BaseClientTransport } from "../../../transport/base/client";
import type { ClientTransportOptions, EventDefinitions } from "../../../types";

/**
 * Base options for vanilla transport clients
 */
export type VanillaClientOptions<TEventDefinitions extends EventDefinitions> =
  Omit<ClientTransportOptions<TEventDefinitions>, "definitions"> & {
    /**
     * Whether to auto-connect on creation
     * @default true
     */
    autoConnect?: boolean;
  };

/**
 * Constructor type for transport clients
 */
export type TransportConstructor<
  TEventDefinitions extends EventDefinitions,
  TClient extends BaseClientTransport<TEventDefinitions>,
  TTransportOptions extends object = object,
> = new (
  url: string,
  options: ClientTransportOptions<TEventDefinitions> & TTransportOptions
) => TClient;

/**
 * Creates a vanilla transport client with auto-connect support
 *
 * This is a factory helper that wraps the transport client creation
 * with common auto-connect logic.
 *
 * @internal
 */
export function createVanillaClient<
  TEventDefinitions extends EventDefinitions,
  TClient extends BaseClientTransport<TEventDefinitions>,
  TTransportOptions extends object = object,
>(
  TransportClass: TransportConstructor<
    TEventDefinitions,
    TClient,
    TTransportOptions
  >,
  url: string,
  definitions: TEventDefinitions,
  options?: VanillaClientOptions<TEventDefinitions> & TTransportOptions
): TClient {
  const client = new TransportClass(url, {
    definitions,
    validate: options?.validate,
    reconnect: options?.reconnect,
    ...options,
  } as ClientTransportOptions<TEventDefinitions> & TTransportOptions);

  const autoConnect = options?.autoConnect ?? true;
  if (autoConnect) {
    client.connect();
  }

  return client;
}

/**
 * Creates a factory function for vanilla transport clients with shared configuration
 *
 * This enables creating multiple clients with the same schemas and default options,
 * only varying the URL.
 *
 * @internal
 */
export function createTransportClientFactory<
  TEventDefinitions extends EventDefinitions,
  TClient extends BaseClientTransport<TEventDefinitions>,
  TTransportOptions extends object = object,
>(
  TransportClass: TransportConstructor<
    TEventDefinitions,
    TClient,
    TTransportOptions
  >,
  schemas: TEventDefinitions,
  defaultOptions?: VanillaClientOptions<TEventDefinitions> & TTransportOptions
): (
  url: string,
  options?: VanillaClientOptions<TEventDefinitions> & TTransportOptions
) => TClient {
  return (
    url: string,
    options?: VanillaClientOptions<TEventDefinitions> & TTransportOptions
  ) =>
    createVanillaClient(TransportClass, url, schemas, {
      ...defaultOptions,
      ...options,
    } as VanillaClientOptions<TEventDefinitions> & TTransportOptions);
}
