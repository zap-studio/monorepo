import type { StandardSchemaV1 } from "@zap-studio/validation";
import { standardValidate } from "@zap-studio/validation";

import type {
  AfterHook,
  BeforeHook,
  ErrorHook,
  InferSchemaOutput,
  NormalizedRequest,
  NormalizedResponse,
  RegisterOptions,
  SchemaRouteOptions,
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

type HandlerStore = Record<string, HandlerEntry<unknown>>;

export interface WebhookRouterOptions {
  /** Global hooks executed after successful route handler completion. */
  after?: AfterHook | AfterHook[];
  /** Global hooks executed before route-level hooks and verification. */
  before?: BeforeHook | BeforeHook[];
  /** Global error hook used to override the default `500` response. */
  onError?: ErrorHook;
  /** Required path prefix for all webhook routes. Defaults to `"/webhooks/"`. */
  prefix?: string;
  /** Optional request verification function (for signature checks, auth, etc.). */
  verify?: (req: NormalizedRequest) => Promise<void> | void;
}

/**
 * Main webhook router class.
 *
 * Register routes with typed schemas and call `handle` with a normalized request.
 */
export class WebhookRouter<TMap = unknown> {
  private readonly handlers: HandlerStore = {};
  private readonly verify?: (req: NormalizedRequest) => Promise<void> | void;
  private readonly globalBeforeHooks: BeforeHook[] = [];
  private readonly globalAfterHooks: AfterHook[] = [];
  private readonly globalErrorHook?: ErrorHook;
  private readonly prefix: string;

  constructor(opts?: WebhookRouterOptions) {
    this.prefix = opts?.prefix ?? "/webhooks/";

    if (opts?.verify) {
      this.verify = opts.verify;
    }
    if (opts?.before) {
      this.globalBeforeHooks = Array.isArray(opts.before) ? opts.before : [opts.before];
    }
    if (opts?.after) {
      this.globalAfterHooks = Array.isArray(opts.after) ? opts.after : [opts.after];
    }
    if (opts?.onError) {
      this.globalErrorHook = opts.onError;
    }
  }

  /**
   * Register a webhook handler for a specific path.
   *
   * When a schema is provided, `payload` is inferred from the schema output type.
   *
   * @param path - Route path relative to configured prefix.
   * @param handlerOrOptions - Handler function or schema-based registration options.
   * @returns The same router instance with an updated internal route type map.
   */
  register<Path extends string, TSchema extends StandardSchemaV1<unknown, unknown>>(
    path: Path,
    handlerOrOptions: SchemaRouteOptions<TSchema>,
  ): WebhookRouter<TMap & Record<Path, InferSchemaOutput<TSchema>>>;
  register<Path extends string, TPayload>(
    path: Path,
    handlerOrOptions: RegisterOptions<TPayload>,
  ): WebhookRouter<TMap & Record<Path, TPayload>>;
  register<Path extends string>(
    path: Path,
    handlerOrOptions: WebhookHandler<unknown>,
  ): WebhookRouter<TMap & Record<Path, unknown>>;
  register(
    path: string,
    handlerOrOptions: WebhookHandler<unknown> | RegisterOptions<unknown>,
  ): WebhookRouter<TMap> {
    if (typeof handlerOrOptions === "function") {
      this.handlers[path] = {
        handler: handlerOrOptions,
      };
    } else {
      let beforeHooks: BeforeHook[] | undefined;
      if (handlerOrOptions.before) {
        beforeHooks = Array.isArray(handlerOrOptions.before)
          ? handlerOrOptions.before
          : [handlerOrOptions.before];
      }

      let afterHooks: AfterHook[] | undefined;
      if (handlerOrOptions.after) {
        afterHooks = Array.isArray(handlerOrOptions.after)
          ? handlerOrOptions.after
          : [handlerOrOptions.after];
      }

      const entry: HandlerEntry<unknown> = {
        handler: handlerOrOptions.handler,
      };

      if (handlerOrOptions.schema !== undefined) {
        entry.schema = handlerOrOptions.schema;
      }
      if (beforeHooks !== undefined) {
        entry.before = beforeHooks;
      }
      if (afterHooks !== undefined) {
        entry.after = afterHooks;
      }

      this.handlers[path] = entry;
    }

    return this;
  }

  /**
   * Handles a normalized incoming webhook request.
   *
   * @param req - Normalized request object.
   * @returns Normalized response for the adapter/framework layer.
   */
  async handle(req: NormalizedRequest): Promise<NormalizedResponse> {
    try {
      const normalizedPath = this.normalizePath(req);

      if (normalizedPath === null) {
        return { status: 404, body: { error: "not found" } };
      }

      const handlerEntry = this.handlers[normalizedPath];
      if (!handlerEntry) {
        return { status: 404, body: { error: "not found" } };
      }

      await this.runGlobalBeforeHooks(req);
      await this.runRouteBeforeHooks(req, handlerEntry.before);

      if (this.verify) {
        await this.verify(req);
      }

      const parsedJson = this.parseRequestBody(req);
      const validationResult = await this.validatePayload(parsedJson, handlerEntry.schema);

      if (this.isErrorResponse(validationResult)) {
        return validationResult;
      }

      const response = await this.executeHandler(handlerEntry.handler, req, validationResult);

      await this.runRouteAfterHooks(req, response, handlerEntry.after);
      await this.runGlobalAfterHooks(req, response);

      return response;
    } catch (error) {
      return this.handleError(error, req);
    }
  }

  private normalizePath(req: NormalizedRequest): string | null {
    let pathname = req.path;
    try {
      // Try to parse as URL (e.g. handles full URLs like https://example.com/webhooks/path -> /webhooks/path)
      const url = new URL(req.path);
      pathname = url.pathname;
    } catch {
      // Not a full URL, use the path as-is
    }

    // Require prefix (e.g. /webhooks/path -> /path)
    if (!pathname.startsWith(this.prefix)) {
      // Path doesn't start with the required prefix - not a webhook route
      return null;
    }

    // Strip prefix and keep the leading slash
    pathname = pathname.slice(this.prefix.length - 1);
    req.path = pathname;

    // Normalize path by removing leading slash for handler matching (e.g. /path -> path)
    const normalizedPath = pathname.startsWith("/") ? pathname.slice(1) : pathname;

    return normalizedPath;
  }

  private async runGlobalBeforeHooks(req: NormalizedRequest): Promise<void> {
    for (const hook of this.globalBeforeHooks) {
      await hook(req);
    }
  }

  private async runRouteBeforeHooks(req: NormalizedRequest, before?: BeforeHook[]): Promise<void> {
    if (before) {
      for (const hook of before) {
        await hook(req);
      }
    }
  }

  private parseRequestBody<TParsed = unknown>(req: NormalizedRequest): TParsed | undefined {
    try {
      const parsed = JSON.parse(new TextDecoder().decode(req.rawBody));
      req.json = parsed;
      return parsed as TParsed;
    } catch {
      return;
    }
  }

  private isErrorResponse(value: unknown): value is NormalizedResponse {
    return (
      typeof value === "object" &&
      value !== null &&
      "status" in value &&
      typeof value.status === "number"
    );
  }

  private async validatePayload<TPayload>(
    parsedJson: unknown,
    schema?: StandardSchemaV1<unknown, TPayload>,
  ): Promise<TPayload | NormalizedResponse> {
    if (!schema) {
      return parsedJson as TPayload;
    }

    const result = await standardValidate(schema, parsedJson, {
      throwOnError: false,
    });

    if (result.issues) {
      return {
        status: 400,
        body: {
          error: "validation failed",
          issues: result.issues.map((issue) => ({
            path: issue.path?.map((p) =>
              typeof p === "object" && "key" in p ? String(p.key) : String(p),
            ),
            message: issue.message,
          })),
        },
      };
    }

    return result.value as TPayload;
  }

  private async executeHandler<TPayload = unknown>(
    handler: WebhookHandler<TPayload>,
    req: NormalizedRequest,
    validatedPayload: TPayload,
  ): Promise<NormalizedResponse> {
    const responded = await handler({
      req,
      payload: validatedPayload,
      ack: async (r?: Partial<NormalizedResponse>) => {
        const response: NormalizedResponse = {
          status: r?.status ?? 200,
          body: r?.body ?? "ok",
        };

        if (r?.headers !== undefined) {
          response.headers = r.headers;
        }

        return response;
      },
    });

    return responded ?? { status: 200, body: "ok" };
  }

  private async runRouteAfterHooks(
    req: NormalizedRequest,
    response: NormalizedResponse,
    after?: AfterHook[],
  ): Promise<void> {
    if (after) {
      for (const hook of after) {
        await hook(req, response);
      }
    }
  }

  private async runGlobalAfterHooks(
    req: NormalizedRequest,
    response: NormalizedResponse,
  ): Promise<void> {
    for (const hook of this.globalAfterHooks) {
      await hook(req, response);
    }
  }

  private async handleError<TError = unknown>(
    error: TError,
    req: NormalizedRequest,
  ): Promise<NormalizedResponse> {
    if (this.globalErrorHook) {
      const errorResponse = await this.globalErrorHook(error as Error, req);
      if (errorResponse) {
        return errorResponse;
      }
    }

    return {
      status: 500,
      body: {
        error: error instanceof Error ? error.message : "Internal server error",
      },
    };
  }
}

/**
 * Factory helper for creating a webhook router instance.
 *
 * @param opts - Optional global router options.
 * @returns A new webhook router.
 */
export function createWebhookRouter(opts?: WebhookRouterOptions): WebhookRouter {
  return new WebhookRouter(opts);
}
