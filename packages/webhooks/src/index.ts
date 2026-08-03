/**
 * Schema-first webhook router primitives.
 *
 * @module @zap-studio/webhooks
 */

import type { StandardSchemaV1 } from "@zap-studio/validation";
import { standardValidate } from "@zap-studio/validation";

import type {
  AfterHook,
  BeforeHook,
  ErrorHook,
  InferSchemaOutput,
  RegisterOptions,
  SchemaRouteOptions,
  VerifyFn,
  WebhookContext,
  WebhookHandler,
} from "./types/index.js";

/**
 * Schema-first webhook router with path dispatching, validation, and optional verification.
 *
 * @template TMap - Internal route payload map built incrementally via `register`.
 */
interface HandlerEntry<TPayload = unknown> {
  after?: AfterHook[];
  before?: BeforeHook[];
  handler: WebhookHandler<TPayload>;
  schema?: StandardSchemaV1<unknown, TPayload>;
}

type HandlerStore = Record<string, HandlerEntry>;

export interface WebhookRouterOptions {
  /** Global hooks executed after successful route handler completion. */
  after?: AfterHook | AfterHook[];
  /** Global hooks executed before route-level hooks and verification. */
  before?: BeforeHook | BeforeHook[];
  /** Global error hook used to override the default `500` response. */
  onError?: ErrorHook;
  /**
   * Required path prefix for all webhook routes. Defaults to `"/webhooks"`.
   *
   * Normalized internally: leading slash added, trailing slash stripped,
   * duplicate slashes collapsed. Use `""` or `"/"` to mount at the root.
   */
  prefix?: string;
  /** Optional request verification function (for signature checks, auth, etc.). */
  verify?: VerifyFn;
}

const toArray = <T>(value: T | T[] | undefined): T[] => {
  if (value === undefined) {
    return [];
  }

  return Array.isArray(value) ? value : [value];
};

const notFoundResponse = (): Response =>
  Response.json({ error: "not found" }, { status: 404 });

/**
 * Normalizes a path to its canonical form: leading slash, no trailing slash,
 * duplicate slashes collapsed. The root path is `"/"`.
 */
const normalizePath = (path: string): string => {
  const withLeadingSlash = path.startsWith("/") ? path : `/${path}`;
  const collapsed = withLeadingSlash.replaceAll(/\/{2,}/gu, "/");

  return collapsed.length > 1 && collapsed.endsWith("/")
    ? collapsed.slice(0, -1)
    : collapsed;
};

/**
 * Main webhook router class.
 *
 * Register routes with typed schemas and call `handle` with a Web API `Request`.
 */
export class WebhookRouter<TMap = unknown> {
  private readonly handlers: HandlerStore = {};
  private readonly verify: VerifyFn | undefined;
  private readonly globalBeforeHooks: BeforeHook[] = [];
  private readonly globalAfterHooks: AfterHook[] = [];
  private readonly globalErrorHook: ErrorHook | undefined;
  private readonly prefix: string;

  /**
   * Creates a webhook router with optional global hooks and verification behavior.
   *
   * @param opts - Router-level options.
   */
  constructor(opts: WebhookRouterOptions = {}) {
    this.prefix = normalizePath(opts.prefix ?? "/webhooks");
    this.verify = opts.verify;
    this.globalBeforeHooks = toArray(opts.before);
    this.globalAfterHooks = toArray(opts.after);
    this.globalErrorHook = opts.onError;
  }

  /**
   * Register a webhook handler for a specific path.
   *
   * When a schema is provided, `payload` is inferred from the schema output type.
   *
   * @param path - Route path relative to configured prefix, starting with `/` (e.g. `"/stripe"`).
   * @param handlerOrOptions - Handler function or schema-based registration options.
   * @returns The same router instance with an updated internal route type map.
   */
  register<
    Path extends `/${string}`,
    TSchema extends StandardSchemaV1<unknown, unknown>,
  >(
    path: Path,
    handlerOrOptions: SchemaRouteOptions<TSchema>
  ): WebhookRouter<TMap & Record<Path, InferSchemaOutput<TSchema>>>;
  register<Path extends `/${string}`, TPayload>(
    path: Path,
    handlerOrOptions: RegisterOptions<TPayload>
  ): WebhookRouter<TMap & Record<Path, TPayload>>;
  register<Path extends `/${string}`>(
    path: Path,
    handlerOrOptions: WebhookHandler
  ): WebhookRouter<TMap & Record<Path, unknown>>;
  register(
    path: string,
    handlerOrOptions: WebhookHandler | RegisterOptions<unknown>
  ): this {
    this.handlers[normalizePath(path)] =
      typeof handlerOrOptions === "function"
        ? { handler: handlerOrOptions }
        : WebhookRouter.createHandlerEntry(handlerOrOptions);

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
   */
  async handle(request: Request): Promise<Response> {
    const path = this.matchPath(request);
    if (path === null) {
      return notFoundResponse();
    }

    const handlerEntry = this.handlers[path];
    if (!handlerEntry) {
      return notFoundResponse();
    }

    const ctx: WebhookContext = {
      path,
      rawBody: new Uint8Array(0),
      request,
    };

    try {
      ctx.rawBody = new Uint8Array(await request.arrayBuffer());

      await this.runGlobalBeforeHooks(ctx);
      await WebhookRouter.runRouteBeforeHooks(ctx, handlerEntry.before);

      if (this.verify) {
        await this.verify(ctx);
      }

      const parsedJson = WebhookRouter.parseRequestBody(ctx);
      const validationResult = await WebhookRouter.validatePayload(
        parsedJson,
        handlerEntry.schema
      );

      if (validationResult instanceof Response) {
        return validationResult;
      }

      const response = await WebhookRouter.executeHandler(
        handlerEntry.handler,
        ctx,
        validationResult
      );

      await WebhookRouter.runRouteAfterHooks(ctx, response, handlerEntry.after);
      await this.runGlobalAfterHooks(ctx, response);

      return response;
    } catch (error) {
      return await this.handleError(error, ctx);
    }
  }

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
    if (!pathname.startsWith(`${this.prefix}/`)) {
      return null;
    }

    return pathname.slice(this.prefix.length);
  }

  private static async runHooks<T>(
    hooks: T[],
    run: (hook: T) => void | Promise<void>
  ): Promise<void> {
    for (const hook of hooks) {
      // oxlint-disable-next-line no-await-in-loop -- hooks run sequentially; order + short-circuit matter.
      await run(hook);
    }
  }

  private async runGlobalBeforeHooks(ctx: WebhookContext): Promise<void> {
    await WebhookRouter.runHooks(this.globalBeforeHooks, async (hook) => {
      await hook(ctx);
    });
  }

  private static createHandlerEntry(
    options: RegisterOptions<unknown>
  ): HandlerEntry {
    const entry: HandlerEntry = {
      handler: options.handler,
    };

    if (options.schema !== undefined) {
      entry.schema = options.schema;
    }

    if (options.before !== undefined) {
      entry.before = Array.isArray(options.before)
        ? options.before
        : [options.before];
    }

    if (options.after !== undefined) {
      entry.after = Array.isArray(options.after)
        ? options.after
        : [options.after];
    }

    return entry;
  }

  private static async runRouteBeforeHooks(
    ctx: WebhookContext,
    before?: BeforeHook[]
  ): Promise<void> {
    if (before) {
      await WebhookRouter.runHooks(before, async (hook) => {
        await hook(ctx);
      });
    }
  }

  private static parseRequestBody(ctx: WebhookContext): unknown {
    try {
      return JSON.parse(new TextDecoder().decode(ctx.rawBody)) as unknown;
    } catch {
      return undefined;
    }
  }

  private static async validatePayload<TPayload>(
    parsedJson: unknown,
    schema?: StandardSchemaV1<unknown, TPayload>
  ): Promise<TPayload | Response> {
    if (!schema) {
      // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Without a schema, caller-declared payload type is the route contract.
      return parsedJson as TPayload;
    }

    const result = await standardValidate(schema, parsedJson, {
      throwOnError: false,
    });

    if (result.issues) {
      return Response.json(
        {
          error: "validation failed",
          issues: result.issues.map((issue) => ({
            message: issue.message,
            path: issue.path?.map((p) =>
              typeof p === "object" && "key" in p ? String(p.key) : String(p)
            ),
          })),
        },
        { status: 400 }
      );
    }

    return result.value;
  }

  private static async executeHandler<TPayload = unknown>(
    handler: WebhookHandler<TPayload>,
    ctx: WebhookContext,
    validatedPayload: TPayload
  ): Promise<Response> {
    const responded = await handler({
      ...ctx,
      payload: validatedPayload,
    });

    return responded ?? Response.json("ok");
  }

  private static async runRouteAfterHooks(
    ctx: WebhookContext,
    response: Response,
    after?: AfterHook[]
  ): Promise<void> {
    if (after) {
      await WebhookRouter.runHooks(after, async (hook) => {
        await hook(ctx, response);
      });
    }
  }

  private async runGlobalAfterHooks(
    ctx: WebhookContext,
    response: Response
  ): Promise<void> {
    await WebhookRouter.runHooks(this.globalAfterHooks, async (hook) => {
      await hook(ctx, response);
    });
  }

  private async handleError(
    error: unknown,
    ctx: WebhookContext
  ): Promise<Response> {
    if (this.globalErrorHook) {
      const normalizedError =
        error instanceof Error ? error : new Error("Internal server error");
      const errorResponse = await this.globalErrorHook(normalizedError, ctx);
      if (errorResponse) {
        return errorResponse;
      }
    }

    return Response.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}

/**
 * Factory helper for creating a webhook router instance.
 *
 * @param opts - Optional global router options.
 * @returns A new webhook router.
 */
export const createWebhookRouter = (
  opts?: WebhookRouterOptions
): WebhookRouter => new WebhookRouter(opts);
