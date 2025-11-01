import { describe, expect, it } from "vitest";
import { z } from "zod";
import { WebhookRouter } from "../src/index";
import type { NormalizedRequest } from "../src/types";

describe("WebhookRouter", () => {
	const createMockRequest = (
		path: string,
		body: unknown,
	): NormalizedRequest => ({
		method: "POST",
		path,
		headers: new Headers(),
		rawBody: Buffer.from(JSON.stringify(body)),
	});

	it("should handle webhook without schema validation", async () => {
		interface WebhookMap {
			"/test": { id: string };
		}

		const router = new WebhookRouter<WebhookMap>();

		router.register("/test", async ({ payload, ack }) => {
			expect(payload).toEqual({ id: "123" });
			return ack({ status: 200, body: "success" });
		});

		const response = await router.handle(
			createMockRequest("/test", { id: "123" }),
		);

		expect(response).toEqual({ status: 200, body: "success" });
	});

	it("should validate payload with Zod schema", async () => {
		interface WebhookMap {
			"/payment": { id: string; amount: number };
		}

		const router = new WebhookRouter<WebhookMap>();

		const paymentSchema = z.object({
			id: z.string(),
			amount: z.number().positive(),
		});

		router.register("/payment", {
			schema: paymentSchema,
			handler: async ({ payload, ack }) => {
				expect(payload).toEqual({ id: "pay_123", amount: 100 });
				return ack({ status: 200, body: "payment processed" });
			},
		});

		const response = await router.handle(
			createMockRequest("/payment", { id: "pay_123", amount: 100 }),
		);

		expect(response).toEqual({ status: 200, body: "payment processed" });
	});

	it("should reject invalid payload when schema is provided", async () => {
		interface WebhookMap {
			"/payment": { id: string; amount: number };
		}

		const router = new WebhookRouter<WebhookMap>();

		const paymentSchema = z.object({
			id: z.string(),
			amount: z.number().positive(),
		});

		router.register("/payment", {
			schema: paymentSchema,
			handler: async ({ ack }) => {
				return ack({ status: 200 });
			},
		});

		const response = await router.handle(
			createMockRequest("/payment", { id: "pay_123", amount: -100 }),
		);

		expect(response.status).toBe(400);
		expect(response.body).toHaveProperty("error", "validation failed");
		expect(response.body).toHaveProperty("issues");
	});

	it("should reject payload with missing required fields", async () => {
		interface WebhookMap {
			"/user": { id: string; email: string };
		}

		const router = new WebhookRouter<WebhookMap>();

		const userSchema = z.object({
			id: z.string(),
			email: z.string().email(),
		});

		router.register("/user", {
			schema: userSchema,
			handler: async ({ ack }) => {
				return ack({ status: 200 });
			},
		});

		const response = await router.handle(
			createMockRequest("/user", { id: "123" }),
		);

		expect(response.status).toBe(400);
		expect(response.body).toHaveProperty("error", "validation failed");
	});

	it("should return 404 for unregistered paths", async () => {
		interface WebhookMap {
			"/test": { id: string };
		}

		const router = new WebhookRouter<WebhookMap>();

		const response = await router.handle(
			createMockRequest("/unknown", { id: "123" }),
		);

		expect(response).toEqual({ status: 404, body: { error: "not found" } });
	});

	it("should work with custom verify function", async () => {
		interface WebhookMap {
			"/secure": { data: string };
		}

		let verifyWasCalled = false;

		const router = new WebhookRouter<WebhookMap>({
			verify: async (req) => {
				verifyWasCalled = true;
				expect(req.path).toBe("/secure");
			},
		});

		router.register("/secure", async ({ ack }) => {
			return ack({ status: 200 });
		});

		await router.handle(createMockRequest("/secure", { data: "test" }));

		expect(verifyWasCalled).toBe(true);
	});
});
