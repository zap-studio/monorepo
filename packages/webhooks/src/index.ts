import type { z } from "zod";
import type {
	HandlerMap,
	NormalizedRequest,
	NormalizedResponse,
	RegisterOptions,
} from "./types";

/**
 * A router for handling webhooks with path-based routing and optional request verification.
 *
 * @example
 * ```ts
 * import { z } from "zod";
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
 *   "/payment": PaymentPayload;
 *   "/subscription": SubscriptionPayload;
 * }
 *
 * const router = new WebhookRouter<MyWebhookMap>({
 *   verify: async (req) => {
 *     // Custom verification logic (e.g., signature verification)
 *   },
 * });
 *
 * // Without Zod validation
 * router.register("/payment", async ({ req, payload, ack }) => {
 *   // Handle payment webhook
 *   return ack({ status: 200, body: "Payment received" });
 * });
 *
 * // With Zod validation
 * const subscriptionSchema = z.object({
 *   id: z.string(),
 *   status: z.enum(["active", "canceled"]),
 * });
 *
 * router.register("/subscription", {
 *   schema: subscriptionSchema,
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
		{ handler: HandlerMap<TMap>[string]; schema?: z.ZodType }
	>();
	private verify?: (req: NormalizedRequest) => Promise<void> | void;

	constructor(opts?: {
		verify?: (req: NormalizedRequest) => Promise<void> | void;
	}) {
		if (opts?.verify) this.verify = opts.verify;
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
			this.handlers.set(path, {
				// biome-ignore lint/suspicious/noExplicitAny: We want to allow any type here for flexibility
				handler: handlerOrOptions.handler as any,
				schema: handlerOrOptions.schema,
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
		// strict path matching first (extendable to prefix or pattern)
		const handlerEntry = this.handlers.get(req.path);
		if (!handlerEntry) return { status: 404, body: { error: "not found" } };

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

		// Validate with Zod schema if provided
		let validatedPayload = parsedJson;
		if (handlerEntry.schema) {
			const result = handlerEntry.schema.safeParse(parsedJson);
			if (!result.success) {
				return {
					status: 400,
					body: {
						error: "validation failed",
						issues: result.error.issues,
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
		if (!responded) return { status: 200, body: "ok" };
		return responded as NormalizedResponse;
	}
}
