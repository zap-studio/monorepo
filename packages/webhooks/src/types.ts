/**
 * Public webhook context, handler, and hook type contracts.
 *
 * @module @zap-studio/webhooks/types
 */

import type { Logger } from "@zap-studio/logger";
import type { StandardSchemaV1 } from "@zap-studio/validation";

/**
 * Context shared by hooks, verifiers, and handlers for a single webhook request.
 *
 * The router consumes the request body exactly once, so `request.body` is
 * already used by the time hooks or handlers run — read `rawBody` instead.
 *
 * @example
 * ```ts
 * const before: BeforeHook = (ctx: WebhookContext) => {
 *   console.log("received", ctx.path);
 * };
 * ```
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
 *
 * @example
 * ```ts
 * const handler: WebhookHandler<{ type: string }> = ({ payload }: HandlerContext<{ type: string }>) => {
 *   console.log(payload.type);
 * };
 * ```
 */
export interface HandlerContext<TPayload = unknown> extends WebhookContext {
  /** The validated webhook payload */
  payload: TPayload;
}

/** Internal handler entry stored per registered route. */
export interface HandlerEntry<TPayload = unknown> {
  /** Route-level hooks that run after successful processing. */
  after?: AfterHook[];
  /** Route-level hooks that run before request processing. */
  before?: BeforeHook[];
  /** The handler function to process the webhook. */
  handler: WebhookHandler<TPayload>;
  /** Optional Standard Schema validator to validate the webhook payload. */
  schema?: StandardSchemaV1<unknown, TPayload>;
  /** Route-specific request verifier. Overrides the router-level `verify` for this route only. */
  verify?: VerifyFn;
}

/**
 * Configuration options for creating a `WebhookRouter`.
 *
 * @example
 * ```ts
 * const options: WebhookRouterOptions = {
 *   prefix: "/webhooks",
 *   verify: createHmacVerifier({ headerName: "x-signature", secret }),
 * };
 * ```
 */
export interface WebhookRouterOptions {
  /** Global hooks executed after successful route handler completion. */
  after?: AfterHook | AfterHook[];
  /** Global hooks executed before route-level hooks and verification. */
  before?: BeforeHook | BeforeHook[];
  /** Global error hook used to override the default `500` response. */
  onError?: ErrorHook;
  /**
   * Optional logger for router internals. When omitted, nothing is logged.
   *
   * Logs each delivery attempt and handler dispatch at `debug`, and
   * verification failures and unmatched routes at `warn`.
   */
  logger?: Logger;
  /**
   * Required path prefix for all webhook routes. Defaults to `"/webhooks"`.
   *
   * Normalized internally: leading slash added, trailing slash stripped,
   * duplicate slashes collapsed. Use `""` or `"/"` to mount at the root.
   */
  prefix?: string;
  /**
   * Optional request verification function (for signature checks, auth, etc.),
   * used as the default for any route that doesn't set its own `verify` in
   * {@link RegisterOptions}.
   */
  verify?: VerifyFn;
}

/**
 * Route registration options for a webhook handler.
 *
 * @example
 * ```ts
 * const options: RegisterOptions<{ type: string }> = {
 *   schema: stripeEventSchema,
 *   verify: createHmacVerifier({ headerName: "stripe-signature", secret }),
 *   handler: ({ payload }) => console.log(payload.type),
 * };
 * ```
 */
export interface RegisterOptions<T> {
  /** Hooks that run after successful processing (before global after hooks) */
  after?: AfterHook | AfterHook[];
  /** Hooks that run before request processing (after global before hooks) */
  before?: BeforeHook | BeforeHook[];
  /** The handler function to process the webhook */
  handler: WebhookHandler<T>;
  /** Optional Standard Schema validator to validate the webhook payload */
  schema?: StandardSchemaV1<unknown, T>;
  /**
   * Route-specific request verifier. When set, overrides the router-level
   * `verify` (`WebhookRouterOptions.verify`) for this route only — useful when
   * different routes on the same router are signed by different providers.
   */
  verify?: VerifyFn;
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
 *
 * @example
 * ```ts
 * const stripeRoute: SchemaRouteOptions<typeof stripeEventSchema> = {
 *   schema: stripeEventSchema,
 *   handler: ({ payload }) => console.log(payload.type),
 * };
 * ```
 */
export type SchemaRouteOptions<TSchema extends StandardSchemaV1<unknown, unknown>> = Omit<
  RegisterOptions<InferSchemaOutput<TSchema>>,
  "schema"
> & {
  schema: TSchema;
};

/** A single route's registration shape, as used by schema-driven route dictionaries. */
export interface RouteLike {
  /** Hooks that run after successful processing. */
  after?: AfterHook | AfterHook[];
  /** Hooks that run before request processing. */
  before?: BeforeHook | BeforeHook[];
  /** The handler function to process the webhook. */
  handler: WebhookHandler;
  /** Standard Schema validator the route's payload type is inferred from. */
  schema: StandardSchemaV1<unknown, unknown>;
}

/**
 * Applies schema-driven payload inference to each route entry.
 *
 * @template TRoutes - Route dictionary keyed by webhook path.
 *
 * @example
 * ```ts
 * const routes: SchemaRoutes<{ "/stripe": { handler: WebhookHandler; schema: typeof stripeEventSchema } }> = {
 *   "/stripe": { schema: stripeEventSchema, handler: ({ payload }) => console.log(payload.type) },
 * };
 * ```
 */
export type SchemaRoutes<TRoutes extends Record<string, RouteLike>> = {
  [P in keyof TRoutes]: SchemaRouteOptions<TRoutes[P]["schema"]>;
};

/**
 * The webhook handler function, responsible for processing incoming webhook events.
 *
 * Return a `Response` to control the reply, or `undefined` to let the router
 * respond with its default `200` acknowledgement.
 *
 * @example
 * ```ts
 * const handler: WebhookHandler<{ type: string }> = ({ payload }) => {
 *   console.log(payload.type);
 * };
 * ```
 */
export type WebhookHandler<TPayload = unknown> = (
  ctx: HandlerContext<TPayload>,
) => Promise<Response | undefined> | Response | undefined;

/**
 * Maps route keys to their payload-specific webhook handlers.
 *
 * @example
 * ```ts
 * const handlers: HandlerMap<{ "/stripe": { type: string } }> = {
 *   "/stripe": ({ payload }) => console.log(payload.type),
 * };
 * ```
 */
export type HandlerMap<TMap extends Record<string, unknown>> = {
  [P in keyof TMap]: WebhookHandler<TMap[P]>;
};

/**
 * Builds a webhook payload map from a schema-based route dictionary.
 *
 * @template TRoutes - Route dictionary keyed by webhook path.
 *
 * @example
 * ```ts
 * type Payloads = InferWebhookMapFromRoutes<{
 *   "/stripe": { handler: WebhookHandler; schema: typeof stripeEventSchema };
 * }>;
 * ```
 */
export type InferWebhookMapFromRoutes<TRoutes extends Record<string, RouteLike>> = {
  [P in keyof TRoutes]: InferSchemaOutput<TRoutes[P]["schema"]>;
};

/**
 * Verification function for incoming requests. Throws to reject the request.
 *
 * @example
 * ```ts
 * const verify: VerifyFn = createHmacVerifier({ headerName: "x-signature", secret });
 * ```
 */
export type VerifyFn = (ctx: WebhookContext) => Promise<void> | void;

/**
 * Hook function that runs before request processing
 *
 * @example
 * ```ts
 * const before: BeforeHook = (ctx) => console.log("received", ctx.path);
 * ```
 */
export type BeforeHook = (ctx: WebhookContext) => Promise<void> | void;

/**
 * Hook function that runs after successful request processing.
 *
 * The hook receives the outgoing response as-is; call `response.clone()`
 * before reading its body to avoid consuming the stream sent to the client.
 *
 * @example
 * ```ts
 * const after: AfterHook = (ctx, response) => console.log(response.status);
 * ```
 */
export type AfterHook = (ctx: WebhookContext, response: Response) => Promise<void> | void;

/**
 * Hook function that runs when an error occurs
 *
 * @example
 * ```ts
 * const onError: ErrorHook = (error) => Response.json({ error: error.message }, { status: 500 });
 * ```
 */
export type ErrorHook = (
  error: Error,
  ctx: WebhookContext,
) => Promise<Response | undefined> | Response | undefined;
