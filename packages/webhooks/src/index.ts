import type {
	HandlerMap,
	NormalizedRequest,
	NormalizedResponse,
} from "./types";

/**
 * A router for handling webhooks with path-based routing and optional request verification.
 *
 * @example
 * ```ts
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
 * router.register("/payment", async ({ req, payload, ack }) => {
 *   // Handle payment webhook
 *   return ack({ status: 200, body: "Payment received" });
 * });
 *
 * router.register("/subscription", async ({ req, payload, ack }) => {
 *   // Handle subscription webhook
 *   return ack({ status: 200, body: "Subscription updated" });
 * });
 *
 * // In your server handler
 * const response = await router.handle(incomingRequest);
 * ```
 */

// biome-ignore lint/suspicious/noExplicitAny: We want to allow any type here for flexibility
export class WebhookRouter<TMap extends Record<string, any>> {
	private handlers = new Map<string, HandlerMap<TMap>[string]>();
	private verify?: (req: NormalizedRequest) => Promise<void> | void;

	constructor(opts?: {
		verify?: (req: NormalizedRequest) => Promise<void> | void;
	}) {
		if (opts?.verify) this.verify = opts.verify;
	}

	register<Path extends keyof TMap & string>(
		path: Path,
		handler: HandlerMap<TMap>[Path],
	) {
		// biome-ignore lint/suspicious/noExplicitAny: We want to allow any type here for flexibility
		this.handlers.set(path, handler as any);
	}

	async handle(req: NormalizedRequest): Promise<NormalizedResponse> {
		// strict path matching first (extendable to prefix or pattern)
		const handler = this.handlers.get(req.path);
		if (!handler) return { status: 404, body: { error: "not found" } };

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

		// call handler with typed payload = generic caller responsibility
		// biome-ignore lint/suspicious/noExplicitAny: We want to allow any type here for flexibility
		const maybePayload = parsedJson as any;
		const responded = await handler({
			req,
			payload: maybePayload,
			ack: async (r) => ({
				status: r?.status ?? 200,
				body: r?.body ?? "ok",
				headers: r?.headers,
			}),
		});
		if (!responded) return { status: 200, body: "ok" };
		return responded as NormalizedResponse;
	}
}
