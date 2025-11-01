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
 * interface PaymentPayload {
 *   id: string;
 *   amount: number;
 *   currency: string;
 * }
 *
 * interface SubscriptionPayload {
 *   id: string;
 *   status: "active" | "canceled";
 * }
 *
 * interface MyWebhookMap {
 *   "payment": PaymentPayload;
 *   "subscription": SubscriptionPayload;
 * }
 *
 * const router = new WebhookRouter<MyWebhookMap>({
 *   verify: async (req) => {
 *     // Custom verification logic (e.g., signature verification)
 *   },
 * });
 *
 * // Without schema validation
 * router.register("/payment", async ({ req, payload, ack }) => {
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
 * router.register("/subscription", {
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
	private handlers = new Map<
		string,
		{
			handler: HandlerMap<TMap>[string];
			schema?: SchemaValidator<unknown>;
			before?: BeforeHook[];
			after?: AfterHook[];
		}
	>();
	private verify?: (req: NormalizedRequest) => Promise<void> | void;
	private globalBeforeHooks: BeforeHook[] = [];
	private globalAfterHooks: AfterHook[] = [];
	private globalErrorHook?: ErrorHook;

	constructor(opts?: {
		verify?: (req: NormalizedRequest) => Promise<void> | void;
		before?: BeforeHook | BeforeHook[];
		after?: AfterHook | AfterHook[];
		onError?: ErrorHook;
	}) {
		if (opts?.verify) this.verify = opts.verify;
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
		if (opts?.onError) this.globalErrorHook = opts.onError;
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
	 * router.register("/webhook", async ({ payload, ack }) => {
	 *   return ack({ status: 200 });
	 * });
	 *
	 * // Handler with Zod validation
	 * router.register("/webhook", {
	 *   schema: z.object({ id: z.string() }),
	 *   handler: async ({ payload, ack }) => {
	 *     // payload.id is validated and typed as string
	 *     return ack({ status: 200 });
	 *   },
	 * });
	 *
	 * // Handler with lifecycle hooks
	 * router.register("/webhook", {
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
		handlerOrOptions: HandlerMap<TMap>[Path] | RegisterOptions<TMap[Path]>,
	) {
		if (typeof handlerOrOptions === "function") {
			// biome-ignore lint/suspicious/noExplicitAny: We want to allow any type here for flexibility
			this.handlers.set(path, { handler: handlerOrOptions as any });
		} else {
			const beforeHooks = handlerOrOptions.before
				? Array.isArray(handlerOrOptions.before)
					? handlerOrOptions.before
					: [handlerOrOptions.before]
				: undefined;

			const afterHooks = handlerOrOptions.after
				? Array.isArray(handlerOrOptions.after)
					? handlerOrOptions.after
					: [handlerOrOptions.after]
				: undefined;

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
			// Run global before hooks
			for (const hook of this.globalBeforeHooks) {
				await hook(req);
			}

			// strict path matching first (extendable to prefix or pattern)
			const handlerEntry = this.handlers.get(req.path);
			if (!handlerEntry) return { status: 404, body: { error: "not found" } };

			// Run route-specific before hooks
			if (handlerEntry.before) {
				for (const hook of handlerEntry.before) {
					await hook(req);
				}
			}

			if (this.verify) await this.verify(req);

			// try parse JSON safely
			const parsedJson = (() => {
				try {
					return JSON.parse(req.rawBody.toString());
				} catch {
					return undefined;
				}
			})();
			req.json = parsedJson;

			// Validate with schema if provided
			let validatedPayload = parsedJson;
			if (handlerEntry.schema) {
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
				validatedPayload = result.data;
			}

			// call handler with typed payload
			const responded = await handlerEntry.handler({
				req,
				// biome-ignore lint/suspicious/noExplicitAny: We want to allow any type here for flexibility
				payload: validatedPayload as any,
				ack: async (r?: Partial<NormalizedResponse>) => ({
					status: r?.status ?? 200,
					body: r?.body ?? "ok",
					headers: r?.headers,
				}),
			});
			const response: NormalizedResponse = responded ?? {
				status: 200,
				body: "ok",
			};

			// Run route-specific after hooks
			if (handlerEntry.after) {
				for (const hook of handlerEntry.after) {
					await hook(req, response);
				}
			}

			// Run global after hooks
			for (const hook of this.globalAfterHooks) {
				await hook(req, response);
			}

			return response;
		} catch (error) {
			// Handle errors through onError hook if provided
			if (this.globalErrorHook) {
				const errorResponse = await this.globalErrorHook(error as Error, req);
				if (errorResponse) return errorResponse;
			}

			// Default error response
			return {
				status: 500,
				body: {
					error:
						error instanceof Error ? error.message : "Internal server error",
				},
			};
		}
	}
}
