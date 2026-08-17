/**
 * Schema-first webhook router primitives.
 *
 * @module @zap-studio/webhooks/router
 */

import type { Context, Span } from "@opentelemetry/api";
import type { Logger } from "@zap-studio/logger";
import type { StandardSchemaV1 } from "@zap-studio/validation";

import {
  SpanKind,
  SpanStatusCode,
  context as otelContext,
  propagation,
  trace,
} from "@opentelemetry/api";
import { standardValidate } from "@zap-studio/validation";

import type {
  AfterHook,
  BeforeHook,
  ErrorHook,
  HandlerEntry,
  InferSchemaOutput,
  RegisterOptions,
  SchemaRouteOptions,
  VerifyFn,
  WebhookContext,
  WebhookHandler,
  WebhookRouterOptions,
} from "./types.js";

import { HEADERS_GETTER, recordSpanError, tracer } from "./_otel.js";

/**
 * Schema-first webhook router with path dispatching, validation, and optional verification.
 *
 * @template TMap - Internal route payload map built incrementally via `register`.
 */

const toArray = <T>(value: T | T[] | undefined): T[] => {
  if (value === undefined) {
    return [];
  }

  return Array.isArray(value) ? value : [value];
};

const notFoundResponse = (): Response => Response.json({ error: "not found" }, { status: 404 });

/** Sets `http.response.status_code` and marks `span` `ERROR` on a non-2xx response. */
const finishDelivery = (span: Span, response: Response): Response => {
  span.setAttribute("http.response.status_code", response.status);
  if (!response.ok) {
    span.setStatus({ code: SpanStatusCode.ERROR });
  }
  return response;
};

const bodyDecoder = new TextDecoder();

/**
 * Normalizes a path to its canonical form: leading slash, no trailing slash,
 * duplicate slashes collapsed. The root path is `"/"`.
 */
const normalizePath = (path: string): string => {
  const withLeadingSlash = path.startsWith("/") ? path : `/${path}`;
  const collapsed = withLeadingSlash.includes("//")
    ? withLeadingSlash.replaceAll(/\/{2,}/gu, "/")
    : withLeadingSlash;

  return collapsed.length > 1 && collapsed.endsWith("/") ? collapsed.slice(0, -1) : collapsed;
};

/** Runs the given before-hooks in order against the request context. */
const runBeforeHooks = async (ctx: WebhookContext, hooks?: BeforeHook[]): Promise<void> => {
  if (!hooks || hooks.length === 0) {
    return;
  }

  for (const hook of hooks) {
    await hook(ctx);
  }
};

/** Runs the given after-hooks in order against the request context and response. */
const runAfterHooks = async (
  ctx: WebhookContext,
  response: Response,
  hooks?: AfterHook[],
): Promise<void> => {
  if (!hooks || hooks.length === 0) {
    return;
  }

  for (const hook of hooks) {
    await hook(ctx, response);
  }
};

/** Builds an internal handler entry from route registration options. */
const createHandlerEntry = (options: RegisterOptions<unknown>): HandlerEntry => {
  const entry: HandlerEntry = {
    handler: options.handler,
  };

  if (options.schema !== undefined) {
    entry.schema = options.schema;
  }

  if (options.before !== undefined) {
    entry.before = toArray(options.before);
  }

  if (options.after !== undefined) {
    entry.after = toArray(options.after);
  }

  return entry;
};

/** Parses the request's raw body bytes as JSON, returning `undefined` on invalid JSON. */
const parseRequestBody = (ctx: WebhookContext): unknown => {
  try {
    return JSON.parse(bodyDecoder.decode(ctx.rawBody));
  } catch {
    return undefined;
  }
};

/** Validates the parsed payload against the route schema, returning either the validated value or a `400` response. */
const validatePayload = async <TPayload>(
  parsedJson: unknown,
  schema?: StandardSchemaV1<unknown, TPayload>,
): Promise<TPayload | Response> => {
  if (!schema) {
    // SAFETY: No schema was provided, so the caller-declared `TPayload` is the route's only contract; there is nothing to validate against.
    return parsedJson as TPayload;
  }

  const result = await standardValidate(parsedJson, schema, {
    throwOnError: false,
  });

  if (result.issues) {
    return Response.json(
      {
        error: "validation failed",
        issues: result.issues.map((issue) => ({
          message: issue.message,
          path: issue.path?.map((p) =>
            typeof p === "object" && "key" in p ? String(p.key) : String(p),
          ),
        })),
      },
      { status: 400 },
    );
  }

  return result.value;
};

/** Invokes the route handler with the validated payload, defaulting to a `200 "ok"` response. */
const executeHandler = async <TPayload = unknown>(
  handler: WebhookHandler<TPayload>,
  ctx: WebhookContext,
  validatedPayload: TPayload,
): Promise<Response> => {
  const responded = await handler({
    ...ctx,
    payload: validatedPayload,
  });

  return responded ?? Response.json("ok");
};

/** Runs the route handler inside its own `INTERNAL` span, nested under the delivery span. */
const dispatchHandler = async (
  handlerEntry: HandlerEntry,
  ctx: WebhookContext,
  validatedPayload: unknown,
  deliveryContext: Context,
): Promise<Response> => {
  const handlerSpan = tracer.startSpan(
    `webhook.handler ${ctx.path}`,
    { kind: SpanKind.INTERNAL },
    deliveryContext,
  );

  try {
    return await otelContext.with(
      trace.setSpan(deliveryContext, handlerSpan),
      async () => await executeHandler(handlerEntry.handler, ctx, validatedPayload),
    );
  } catch (error) {
    recordSpanError(handlerSpan, error);
    throw error;
  } finally {
    handlerSpan.end();
  }
};

/**
 * Main webhook router class.
 *
 * Register routes with typed schemas and call `handle` with a Web API `Request`.
 *
 * @example
 * ```ts
 * import { WebhookRouter } from "@zap-studio/webhooks";
 *
 * const router = new WebhookRouter({ prefix: "/webhooks" });
 *
 * router.register("/stripe", {
 *   schema: stripeEventSchema,
 *   handler: async ({ payload }) => {
 *     console.log("Stripe event:", payload.type);
 *   },
 * });
 *
 * export default { fetch: (request: Request) => router.handle(request) };
 * ```
 */
export class WebhookRouter<TMap = unknown> {
  private readonly handlers = new Map<string, HandlerEntry>();
  private readonly verify: VerifyFn | undefined;
  private readonly globalBeforeHooks: BeforeHook[] = [];
  private readonly globalAfterHooks: AfterHook[] = [];
  private readonly globalErrorHook: ErrorHook | undefined;
  private readonly logger: Logger | undefined;
  private readonly prefix: string;
  private readonly prefixWithSlash: string;

  /**
   * Creates a webhook router with optional global hooks and verification behavior.
   *
   * @param opts - Router-level options.
   *
   * @example
   * ```ts
   * const router = new WebhookRouter({
   *   prefix: "/webhooks",
   *   verify: createHmacVerifier({ headerName: "x-signature", secret }),
   *   onError: (error) => Response.json({ error: error.message }, { status: 500 }),
   * });
   * ```
   */
  constructor(opts: WebhookRouterOptions = {}) {
    this.prefix = normalizePath(opts.prefix ?? "/webhooks");
    this.prefixWithSlash = `${this.prefix}/`;
    this.verify = opts.verify;
    this.globalBeforeHooks = toArray(opts.before);
    this.globalAfterHooks = toArray(opts.after);
    this.globalErrorHook = opts.onError;
    this.logger = opts.logger;
  }

  /**
   * Register a webhook handler for a specific path.
   *
   * When a schema is provided, `payload` is inferred from the schema output type.
   *
   * @param path - Route path relative to configured prefix, starting with `/` (e.g. `"/stripe"`).
   * @param handlerOrOptions - Handler function or schema-based registration options.
   * @returns The same router instance with an updated internal route type map.
   *
   * @example
   * ```ts
   * router.register("/stripe", {
   *   schema: stripeEventSchema,
   *   handler: async ({ payload }) => {
   *     console.log(payload.type); // typed from stripeEventSchema
   *   },
   * });
   * ```
   */
  register<Path extends `/${string}`, TSchema extends StandardSchemaV1<unknown, unknown>>(
    path: Path,
    handlerOrOptions: SchemaRouteOptions<TSchema>,
  ): WebhookRouter<TMap & Record<Path, InferSchemaOutput<TSchema>>>;
  /**
   * Register a webhook handler for a specific path, with schema-less registration options.
   *
   * @param path - Route path relative to configured prefix, starting with `/` (e.g. `"/stripe"`).
   * @param handlerOrOptions - Registration options without a schema.
   * @returns The same router instance with an updated internal route type map.
   *
   * @example
   * ```ts
   * router.register("/ping", {
   *   before: (ctx) => console.log("received", ctx.path),
   *   handler: () => Response.json({ ok: true }),
   * });
   * ```
   */
  register<Path extends `/${string}`, TPayload>(
    path: Path,
    handlerOrOptions: RegisterOptions<TPayload>,
  ): WebhookRouter<TMap & Record<Path, TPayload>>;
  /**
   * Register a webhook handler for a specific path, using a plain handler function.
   *
   * @param path - Route path relative to configured prefix, starting with `/` (e.g. `"/stripe"`).
   * @param handlerOrOptions - Handler function to process the webhook.
   * @returns The same router instance with an updated internal route type map.
   *
   * @example
   * ```ts
   * router.register("/health", () => Response.json({ status: "ok" }));
   * ```
   */
  register<Path extends `/${string}`>(
    path: Path,
    handlerOrOptions: WebhookHandler,
  ): WebhookRouter<TMap & Record<Path, unknown>>;
  register(path: string, handlerOrOptions: WebhookHandler | RegisterOptions<unknown>): this {
    this.handlers.set(
      normalizePath(path),
      typeof handlerOrOptions === "function"
        ? { handler: handlerOrOptions }
        : createHandlerEntry(handlerOrOptions),
    );

    return this;
  }

  /**
   * Handles an incoming webhook request.
   *
   * The request body is read exactly once; hooks and handlers receive the raw
   * bytes through the webhook context instead of the request stream.
   *
   * @param request - Incoming Web API request.
   * @returns Web API response for the runtime to send back.
   *
   * @example
   * ```ts
   * // Framework-agnostic: works with any Web API Request/Response runtime.
   * export async function POST(request: Request): Promise<Response> {
   *   return router.handle(request);
   * }
   * ```
   */
  async handle(request: Request): Promise<Response> {
    const requestPath = new URL(request.url).pathname;
    const { method } = request;
    this.logger?.debug("webhook delivery attempt", { path: requestPath });

    const parentContext = propagation.extract(
      otelContext.active(),
      request.headers,
      HEADERS_GETTER,
    );
    const deliverySpan = tracer.startSpan(
      `${method} ${requestPath}`,
      {
        attributes: {
          "http.request.method": method,
          "url.path": requestPath,
        },
        kind: SpanKind.SERVER,
      },
      parentContext,
    );
    const deliveryContext = trace.setSpan(parentContext, deliverySpan);

    try {
      const response = await otelContext.with(
        deliveryContext,
        async () => await this.dispatch(request, requestPath, deliveryContext),
      );
      return finishDelivery(deliverySpan, response);
    } finally {
      deliverySpan.end();
    }
  }

  /** Matches the route, runs hooks/verification/validation, and dispatches the handler. */
  private async dispatch(
    request: Request,
    requestPath: string,
    deliveryContext: Context,
  ): Promise<Response> {
    const path = this.matchPath(request);
    if (path === null) {
      this.logger?.warn("webhook route not matched", { path: requestPath });
      return notFoundResponse();
    }

    const handlerEntry = this.handlers.get(path);
    if (!handlerEntry) {
      this.logger?.warn("webhook route not matched", { path });
      return notFoundResponse();
    }

    const ctx: WebhookContext = {
      path,
      rawBody: new Uint8Array(0),
      request,
    };

    try {
      ctx.rawBody = new Uint8Array(await request.arrayBuffer());

      await runBeforeHooks(ctx, this.globalBeforeHooks);
      await runBeforeHooks(ctx, handlerEntry.before);

      if (this.verify) {
        try {
          await this.verify(ctx);
        } catch (error) {
          this.logger?.warn("webhook verification failed", { error, path });
          throw error;
        }
      }

      const parsedJson = parseRequestBody(ctx);
      const validationResult = await validatePayload(parsedJson, handlerEntry.schema);

      if (validationResult instanceof Response) {
        return validationResult;
      }

      this.logger?.debug("webhook handler dispatch", { path });
      const response = await dispatchHandler(handlerEntry, ctx, validationResult, deliveryContext);

      await runAfterHooks(ctx, response, handlerEntry.after);
      await runAfterHooks(ctx, response, this.globalAfterHooks);

      return response;
    } catch (error) {
      return await this.handleError(error, ctx);
    }
  }

  /** Resolves the incoming request's URL to a registered route key, or `null` if it doesn't match the configured prefix. */
  private matchPath(request: Request): string | null {
    const pathname = normalizePath(new URL(request.url).pathname);

    // Root mount: the whole pathname is the route path.
    if (this.prefix === "/") {
      return pathname;
    }

    if (pathname === this.prefix) {
      return "/";
    }

    // Require prefix followed by a segment boundary, then match handlers on
    // the remainder (e.g. /webhooks/stripe -> /stripe).
    if (!pathname.startsWith(this.prefixWithSlash)) {
      return null;
    }

    return pathname.slice(this.prefix.length);
  }

  /** Builds the error response for a failed request, deferring to the global error hook when set. */
  private async handleError(error: unknown, ctx: WebhookContext): Promise<Response> {
    if (this.globalErrorHook) {
      const normalizedError = error instanceof Error ? error : new Error("Internal server error");
      const errorResponse = await this.globalErrorHook(normalizedError, ctx);
      if (errorResponse) {
        return errorResponse;
      }
    }

    return Response.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    );
  }
}

/**
 * Factory helper for creating a webhook router instance.
 *
 * @param opts - Optional global router options.
 * @returns A new webhook router.
 *
 * @example
 * ```ts
 * import { createWebhookRouter } from "@zap-studio/webhooks";
 *
 * const router = createWebhookRouter({ prefix: "/webhooks" });
 * router.register("/stripe", { schema: stripeEventSchema, handler });
 * ```
 */
export const createWebhookRouter = (opts?: WebhookRouterOptions): WebhookRouter =>
  new WebhookRouter(opts);
