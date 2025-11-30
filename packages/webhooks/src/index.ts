import type {
  AfterHook,
  BeforeHook,
  ErrorHook,
  HandlerMap,
  NormalizedRequest,
  NormalizedResponse,
  RegisterOptions,
  SchemaValidator,
} from "./types";

/**
 * A router for handling webhooks with path-based routing and optional request verification.
 *
 * @example
 * ```ts
 * import { z } from "zod";
 * import { zodValidator } from "@zap-studio/webhooks/adapters";
 *
 * type PaymentPayload = {
 *   id: string;
 *   amount: number;
 *   currency: string;
 * };
 *
 * type SubscriptionPayload = {
 *   id: string;
 *   status: "active" | "canceled";
 * };
 *
 * type MyWebhookMap = {
 *   "payment": PaymentPayload;
 *   "subscription": SubscriptionPayload;
 * };
 *
 * const router = new WebhookRouter<MyWebhookMap>({
 *   prefix: "/webhooks/", // Optional, defaults to "/webhooks/"
 *   verify: async (req) => {
 *     // Custom verification logic (e.g., signature verification)
 *   },
 * });
 *
 * // Without schema validation
 * router.register("payment", async ({ req, payload, ack }) => {
 *   // Handle payment webhook
 *   return ack({ status: 200, body: "Payment received" });
 * });
 *
 * // With schema validation using Zod
 * const subscriptionSchema = z.object({
 *   id: z.string(),
 *   status: z.enum(["active", "canceled"]),
 * });
 *
 * router.register("subscription", {
 *   schema: zodValidator(subscriptionSchema),
 *   handler: async ({ req, payload, ack }) => {
 *     // payload is now validated and typed
 *     return ack({ status: 200, body: "Subscription updated" });
 *   },
 * });
 *
 * // In your server handler
 * const response = await router.handle(incomingRequest);
 * ```
 */

export class WebhookRouter<
  // biome-ignore lint/suspicious/noExplicitAny: We want to allow any type here for flexibility
  TMap extends Record<string, any>,
  TSchema = unknown,
> {
  private readonly handlers = new Map<
    string,
    {
      handler: HandlerMap<TMap>[string];
      schema?: SchemaValidator<TSchema>;
      before?: BeforeHook[];
      after?: AfterHook[];
    }
  >();
  private readonly verify?: (req: NormalizedRequest) => Promise<void> | void;
  private readonly globalBeforeHooks: BeforeHook[] = [];
  private readonly globalAfterHooks: AfterHook[] = [];
  private readonly globalErrorHook?: ErrorHook;
  private readonly prefix: string;

  constructor(opts?: {
    verify?: (req: NormalizedRequest) => Promise<void> | void;
    before?: BeforeHook | BeforeHook[];
    after?: AfterHook | AfterHook[];
    onError?: ErrorHook;
    prefix?: string;
  }) {
    this.prefix = opts?.prefix ?? "/webhooks/";

    if (opts?.verify) {
      this.verify = opts.verify;
    }
    if (opts?.before) {
      this.globalBeforeHooks = Array.isArray(opts.before)
        ? opts.before
        : [opts.before];
    }
    if (opts?.after) {
      this.globalAfterHooks = Array.isArray(opts.after)
        ? opts.after
        : [opts.after];
    }
    if (opts?.onError) {
      this.globalErrorHook = opts.onError;
    }
  }

  /**
   * Register a webhook handler for a specific path.
   *
   * @param path - The webhook path to handle
   * @param handlerOrOptions - Either a handler function or options object with handler and optional schema
   *
   * @example
   * ```ts
   * // Simple handler without validation
   * router.register("webhook", async ({ payload, ack }) => {
   *   return ack({ status: 200 });
   * });
   *
   * // Handler with Zod validation
   * router.register("webhook", {
   *   schema: z.object({ id: z.string() }),
   *   handler: async ({ payload, ack }) => {
   *     // payload.id is validated and typed as string
   *     return ack({ status: 200 });
   *   },
   * });
   *
   * // Handler with lifecycle hooks
   * router.register("webhook", {
   *   before: [async (req) => {
   *     console.log("Route-specific before hook");
   *   }],
   *   handler: async ({ payload, ack }) => {
   *     return ack({ status: 200 });
   *   },
   *   after: [async (req, res) => {
   *     console.log("Route-specific after hook");
   *   }],
   * });
   * ```
   */
  register<Path extends keyof TMap & string>(
    path: Path,
    handlerOrOptions: HandlerMap<TMap>[Path] | RegisterOptions<TMap[Path]>
  ) {
    if (typeof handlerOrOptions === "function") {
      // biome-ignore lint/suspicious/noExplicitAny: We want to allow any type here for flexibility
      this.handlers.set(path, { handler: handlerOrOptions as any });
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

      this.handlers.set(path, {
        // biome-ignore lint/suspicious/noExplicitAny: We want to allow any type here for flexibility
        handler: handlerOrOptions.handler as any,
        schema: handlerOrOptions.schema,
        before: beforeHooks,
        after: afterHooks,
      });
    }
  }

  /**
   * Handle an incoming request.
   *
   * @example
   * ```ts
   * const response = await router.handle(incomingRequest);
   * ```
   */
  async handle(req: NormalizedRequest): Promise<NormalizedResponse> {
    try {
      const normalizedPath = this.normalizePath(req);

      if (normalizedPath === null) {
        return { status: 404, body: { error: "not found" } };
      }

      const handlerEntry = this.handlers.get(normalizedPath);
      if (!handlerEntry) {
        return { status: 404, body: { error: "not found" } };
      }

      await this.runGlobalBeforeHooks(req);
      await this.runRouteBeforeHooks(req, handlerEntry.before);

      if (this.verify) {
        await this.verify(req);
      }

      const parsedJson = this.parseRequestBody(req);
      const validationResult = await this.validatePayload(
        parsedJson,
        handlerEntry.schema
      );

      if (this.isErrorResponse(validationResult)) {
        return validationResult;
      }

      const response = await this.executeHandler(
        handlerEntry.handler,
        req,
        validationResult
      );

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
    const normalizedPath = pathname.startsWith("/")
      ? pathname.slice(1)
      : pathname;

    return normalizedPath;
  }

  private async runGlobalBeforeHooks(req: NormalizedRequest): Promise<void> {
    for (const hook of this.globalBeforeHooks) {
      await hook(req);
    }
  }

  private async runRouteBeforeHooks(
    req: NormalizedRequest,
    before?: BeforeHook[]
  ): Promise<void> {
    if (before) {
      for (const hook of before) {
        await hook(req);
      }
    }
  }

  private parseRequestBody<TParsed = unknown>(
    req: NormalizedRequest
  ): TParsed | undefined {
    try {
      const parsed = JSON.parse(req.rawBody.toString());
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

  private async validatePayload<TParsed = unknown>(
    parsedJson: TParsed,
    schema?: SchemaValidator<TParsed>
  ): Promise<unknown | NormalizedResponse> {
    if (!schema) {
      return parsedJson;
    }

    const result = await schema.validate(parsedJson);
    if (!result.success) {
      return {
        status: 400,
        body: {
          error: "validation failed",
          issues: result.errors,
        },
      };
    }

    return result.data;
  }

  private async executeHandler<TPayload = unknown>(
    handler: HandlerMap<TMap>[string],
    req: NormalizedRequest,
    validatedPayload: TPayload
  ): Promise<NormalizedResponse> {
    const responded = await handler({
      req,
      // biome-ignore lint/suspicious/noExplicitAny: We want to allow any type here for flexibility
      payload: validatedPayload as any,
      ack: async (r?: Partial<NormalizedResponse>) => ({
        status: r?.status ?? 200,
        body: r?.body ?? "ok",
        headers: r?.headers,
      }),
    });

    return responded ?? { status: 200, body: "ok" };
  }

  private async runRouteAfterHooks(
    req: NormalizedRequest,
    response: NormalizedResponse,
    after?: AfterHook[]
  ): Promise<void> {
    if (after) {
      for (const hook of after) {
        await hook(req, response);
      }
    }
  }

  private async runGlobalAfterHooks(
    req: NormalizedRequest,
    response: NormalizedResponse
  ): Promise<void> {
    for (const hook of this.globalAfterHooks) {
      await hook(req, response);
    }
  }

  private async handleError<TError = unknown>(
    error: TError,
    req: NormalizedRequest
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
