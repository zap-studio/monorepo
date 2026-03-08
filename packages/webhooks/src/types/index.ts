import type { StandardSchemaV1 } from "@zap-studio/validation";

/** Framework-agnostic request shape consumed by the webhook router. */
export interface NormalizedRequest {
  /** The headers of the request (e.g. { "Authorization": "Bearer token" }) */
  headers: Headers;
  /** The parsed JSON body of the request if applicable */
  json?: unknown;
  /** The HTTP method of the request */
  method: Request["method"];
  /** The route parameters of the request */
  params?: Record<string, string>;
  /** The path of the request you registered in the router (e.g. "payment", "subscription") */
  path: string;
  /** The query parameters of the request */
  query?: Record<string, string | string[]>;
  /** The raw body of the request (for signature) */
  rawBody: Buffer;
  /** The parsed text body of the request if applicable */
  text?: string;
}

/** Framework-agnostic response shape returned by the webhook router. */
export interface NormalizedResponse<TBody = unknown> {
  /** The body of the response */
  body?: TBody;
  /** The headers of the response */
  headers?: Headers;
  /** The HTTP status code of the response */
  status: number;
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
 * @typeParam TSchema - A Standard Schema type.
 */
export type InferSchemaOutput<TSchema> =
  TSchema extends StandardSchemaV1<unknown, infer TOutput> ? TOutput : never;

/**
 * Route options where schema is required and handler payload is inferred.
 *
 * @typeParam TSchema - Schema used to infer handler payload type.
 */
export type SchemaRouteOptions<
  TSchema extends StandardSchemaV1<unknown, unknown>,
> = Omit<RegisterOptions<InferSchemaOutput<TSchema>>, "schema"> & {
  schema: TSchema;
};

interface RouteLike {
  after?: AfterHook | AfterHook[];
  before?: BeforeHook | BeforeHook[];
  handler: WebhookHandler<unknown>;
  schema: StandardSchemaV1<unknown, unknown>;
}

/**
 * Applies schema-driven payload inference to each route entry.
 *
 * @typeParam TRoutes - Route dictionary keyed by webhook path.
 */
export type SchemaRoutes<TRoutes extends Record<string, RouteLike>> = {
  [P in keyof TRoutes]: SchemaRouteOptions<TRoutes[P]["schema"]>;
};

/** The webhook handler function, responsible for processing incoming webhook events. */
export type WebhookHandler<TPayload = unknown> = (ctx: {
  req: NormalizedRequest;
  payload: TPayload;
  ack: (res?: Partial<NormalizedResponse>) => Promise<NormalizedResponse>;
}) => Promise<NormalizedResponse | undefined> | NormalizedResponse | undefined;

/** Maps route keys to their payload-specific webhook handlers. */
export type HandlerMap<TMap extends Record<string, unknown>> = {
  [P in keyof TMap]: WebhookHandler<TMap[P]>;
};

/**
 * Builds a webhook payload map from a schema-based route dictionary.
 *
 * @typeParam TRoutes - Route dictionary keyed by webhook path.
 */
export type InferWebhookMapFromRoutes<
  TRoutes extends Record<string, RouteLike>,
> = {
  [P in keyof TRoutes]: InferSchemaOutput<TRoutes[P]["schema"]>;
};

/** Verification function for incoming requests */
export type VerifyFn = (req: NormalizedRequest) => Promise<void> | void;

/** Hook function that runs before request processing */
export type BeforeHook = (req: NormalizedRequest) => Promise<void> | void;

/** Hook function that runs after successful request processing */
export type AfterHook = (
  req: NormalizedRequest,
  res: NormalizedResponse
) => Promise<void> | void;

/** Hook function that runs when an error occurs */
export type ErrorHook = (
  error: Error,
  req: NormalizedRequest
) => Promise<NormalizedResponse | undefined> | NormalizedResponse | undefined;
