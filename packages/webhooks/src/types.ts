/**
 * Public webhook context, handler, and hook type contracts.
 *
 * @module @zap-studio/webhooks/types
 */

import type { StandardSchemaV1 } from "@zap-studio/validation";

/**
 * Context shared by hooks, verifiers, and handlers for a single webhook request.
 *
 * The router consumes the request body exactly once, so `request.body` is
 * already used by the time hooks or handlers run — read `rawBody` instead.
 */
export interface WebhookContext {
  /** The matched route key registered on the router (e.g. "stripe") */
  path: string;
  /** The exact request body bytes (for signature verification) */
  rawBody: Uint8Array;
  /** The incoming Web API request (body already consumed by the router) */
  request: Request;
}

/**
 * Handler context extending the shared webhook context with the validated payload.
 *
 * @template TPayload - Validated payload type for the matched route.
 */
export interface HandlerContext<TPayload = unknown> extends WebhookContext {
  /** The validated webhook payload */
  payload: TPayload;
}

/** Route registration options for a webhook handler. */
export interface RegisterOptions<T> {
  /** Hooks that run after successful processing (before global after hooks) */
  after?: AfterHook | AfterHook[];
  /** Hooks that run before request processing (after global before hooks) */
  before?: BeforeHook | BeforeHook[];
  /** The handler function to process the webhook */
  handler: WebhookHandler<T>;
  /** Optional Standard Schema validator to validate the webhook payload */
  schema?: StandardSchemaV1<unknown, T>;
}

/**
 * Infers the output type from a Standard Schema instance.
 *
 * @template TSchema - A Standard Schema type.
 */
export type InferSchemaOutput<TSchema> =
  TSchema extends StandardSchemaV1<unknown, infer TOutput> ? TOutput : never;

/**
 * Route options where schema is required and handler payload is inferred.
 *
 * @template TSchema - Schema used to infer handler payload type.
 */
export type SchemaRouteOptions<
  TSchema extends StandardSchemaV1<unknown, unknown>,
> = Omit<RegisterOptions<InferSchemaOutput<TSchema>>, "schema"> & {
  schema: TSchema;
};

interface RouteLike {
  after?: AfterHook | AfterHook[];
  before?: BeforeHook | BeforeHook[];
  handler: WebhookHandler;
  schema: StandardSchemaV1<unknown, unknown>;
}

/**
 * Applies schema-driven payload inference to each route entry.
 *
 * @template TRoutes - Route dictionary keyed by webhook path.
 */
export type SchemaRoutes<TRoutes extends Record<string, RouteLike>> = {
  [P in keyof TRoutes]: SchemaRouteOptions<TRoutes[P]["schema"]>;
};

/**
 * The webhook handler function, responsible for processing incoming webhook events.
 *
 * Return a `Response` to control the reply, or `undefined` to let the router
 * respond with its default `200` acknowledgement.
 */
export type WebhookHandler<TPayload = unknown> = (
  ctx: HandlerContext<TPayload>
) => Promise<Response | undefined> | Response | undefined;

/** Maps route keys to their payload-specific webhook handlers. */
export type HandlerMap<TMap extends Record<string, unknown>> = {
  [P in keyof TMap]: WebhookHandler<TMap[P]>;
};

/**
 * Builds a webhook payload map from a schema-based route dictionary.
 *
 * @template TRoutes - Route dictionary keyed by webhook path.
 */
export type InferWebhookMapFromRoutes<
  TRoutes extends Record<string, RouteLike>,
> = {
  [P in keyof TRoutes]: InferSchemaOutput<TRoutes[P]["schema"]>;
};

/** Verification function for incoming requests. Throws to reject the request. */
export type VerifyFn = (ctx: WebhookContext) => Promise<void> | void;

/** Hook function that runs before request processing */
export type BeforeHook = (ctx: WebhookContext) => Promise<void> | void;

/**
 * Hook function that runs after successful request processing.
 *
 * The hook receives the outgoing response as-is; call `response.clone()`
 * before reading its body to avoid consuming the stream sent to the client.
 */
export type AfterHook = (
  ctx: WebhookContext,
  response: Response
) => Promise<void> | void;

/** Hook function that runs when an error occurs */
export type ErrorHook = (
  error: Error,
  ctx: WebhookContext
) => Promise<Response | undefined> | Response | undefined;
