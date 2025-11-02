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

// biome-ignore lint/suspicious/noExplicitAny: We want to allow any type here for flexibility
export class WebhookRouter<TMap extends Record<string, any>> {
  private readonly handlers = new Map<
    string,
    {
      handler: HandlerMap<TMap>[string];
      schema?: SchemaValidator<unknown>;
      before?: BeforeHook[];
      after?: AfterHook[];
    }
  >();
  private readonly verify?: (req: NormalizedRequest) => Promise<void> | void;
  private readonly globalBeforeHooks: BeforeHook[] = [];
  private readonly globalAfterHooks: AfterHook[] = [];
  private readonly globalErrorHook?: ErrorHook;

  constructor(opts?: {
    verify?: (req: NormalizedRequest) => Promise<void> | void;
    before?: BeforeHook | BeforeHook[];
    after?: AfterHook | AfterHook[];
    onError?: ErrorHook;
  }) {
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
      const handlerEntry = this.handlers.get(req.path);
      if (!handlerEntry) {
        return { status: 404, body: { error: "not found" } };
      }

      await this.runGlobalBeforeHooks(req);
      await this.runRouteBeforeHooks(handlerEntry, req);

      if (this.verify) {
        await this.verify(req);
      }

      const parsedJson = this.parseRequestBody(req);
      const validationResult = await this.validatePayload(
        handlerEntry,
        parsedJson
      );

      if (this.isErrorResponse(validationResult)) {
        return validationResult;
      }

      const response = await this.executeHandler(
        handlerEntry,
        req,
        validationResult
      );

      await this.runRouteAfterHooks(handlerEntry, req, response);
      await this.runGlobalAfterHooks(req, response);

      return response;
    } catch (error) {
      return this.handleError(error, req);
    }
  }

  private async runGlobalBeforeHooks(req: NormalizedRequest): Promise<void> {
    for (const hook of this.globalBeforeHooks) {
      await hook(req);
    }
  }

  private async runRouteBeforeHooks(
    handlerEntry: {
      handler: HandlerMap<TMap>[string];
      schema?: SchemaValidator<unknown>;
      before?: BeforeHook[];
      after?: AfterHook[];
    },
    req: NormalizedRequest
  ): Promise<void> {
    if (handlerEntry.before) {
      for (const hook of handlerEntry.before) {
        await hook(req);
      }
    }
  }

  private parseRequestBody(req: NormalizedRequest): unknown {
    try {
      const parsed = JSON.parse(req.rawBody.toString());
      req.json = parsed;
      return parsed;
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

  private async validatePayload(
    handlerEntry: {
      handler: HandlerMap<TMap>[string];
      schema?: SchemaValidator<unknown>;
      before?: BeforeHook[];
      after?: AfterHook[];
    },
    parsedJson: unknown
  ): Promise<unknown | NormalizedResponse> {
    if (!handlerEntry.schema) {
      return parsedJson;
    }

    const result = await handlerEntry.schema.validate(parsedJson);
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

  private async executeHandler(
    handlerEntry: {
      handler: HandlerMap<TMap>[string];
      schema?: SchemaValidator<unknown>;
      before?: BeforeHook[];
      after?: AfterHook[];
    },
    req: NormalizedRequest,
    validatedPayload: unknown
  ): Promise<NormalizedResponse> {
    const responded = await handlerEntry.handler({
      req,
      // biome-ignore lint/suspicious/noExplicitAny: We want to allow any type here for flexibility
      payload: validatedPayload as any,
      ack: async (r?: Partial<NormalizedResponse>) => ({
        // biome-ignore lint/style/noMagicNumbers: Default status code is 200 and only used here
        status: r?.status ?? 200,
        body: r?.body ?? "ok",
        headers: r?.headers,
      }),
    });

    return responded ?? { status: 200, body: "ok" };
  }

  private async runRouteAfterHooks(
    handlerEntry: {
      handler: HandlerMap<TMap>[string];
      schema?: SchemaValidator<unknown>;
      before?: BeforeHook[];
      after?: AfterHook[];
    },
    req: NormalizedRequest,
    response: NormalizedResponse
  ): Promise<void> {
    if (handlerEntry.after) {
      for (const hook of handlerEntry.after) {
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

  private async handleError(
    error: unknown,
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
