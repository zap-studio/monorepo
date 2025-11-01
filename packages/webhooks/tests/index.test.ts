import { describe, expect, it } from "vitest";
import { z } from "zod";
import { zodValidator } from "../src/adapters/validators";
import { WebhookRouter } from "../src/index";
import type { NormalizedRequest, SchemaValidator } from "../src/types";

describe("WebhookRouter", () => {
	const createMockRequest = (
		path: string,
		body: unknown,
		method: "POST" | "GET" = "POST",
	): NormalizedRequest => ({
		method,
		path,
		headers: new Headers(),
		rawBody: Buffer.from(JSON.stringify(body)),
	});

	describe("Basic routing", () => {
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

		it("should handle multiple registered paths", async () => {
			interface WebhookMap {
				"/payment": { amount: number };
				"/user": { name: string };
				"/order": { id: string };
			}

			const router = new WebhookRouter<WebhookMap>();

			router.register("/payment", async ({ payload, ack }) => {
				return ack({ status: 200, body: { received: payload.amount } });
			});

			router.register("/user", async ({ payload, ack }) => {
				return ack({
					status: 200,
					body: { greeting: `Hello ${payload.name}` },
				});
			});

			router.register("/order", async ({ payload, ack }) => {
				return ack({ status: 200, body: { orderId: payload.id } });
			});

			const paymentResponse = await router.handle(
				createMockRequest("/payment", { amount: 100 }),
			);
			expect(paymentResponse).toEqual({
				status: 200,
				body: { received: 100 },
			});

			const userResponse = await router.handle(
				createMockRequest("/user", { name: "Alice" }),
			);
			expect(userResponse).toEqual({
				status: 200,
				body: { greeting: "Hello Alice" },
			});

			const orderResponse = await router.handle(
				createMockRequest("/order", { id: "order_123" }),
			);
			expect(orderResponse).toEqual({
				status: 200,
				body: { orderId: "order_123" },
			});
		});

		it("should handle request without explicit response", async () => {
			interface WebhookMap {
				"/silent": { data: string };
			}

			const router = new WebhookRouter<WebhookMap>();

			router.register("/silent", async () => {
				// No return statement - returns undefined
				return undefined;
			});

			const response = await router.handle(
				createMockRequest("/silent", { data: "test" }),
			);

			expect(response).toEqual({ status: 200, body: "ok" });
		});

		it("should preserve request metadata in handler", async () => {
			interface WebhookMap {
				"/metadata": { value: string };
			}

			const router = new WebhookRouter<WebhookMap>();

			router.register("/metadata", async ({ req, ack }) => {
				expect(req.method).toBe("POST");
				expect(req.path).toBe("/metadata");
				expect(req.headers).toBeInstanceOf(Headers);
				expect(req.rawBody).toBeInstanceOf(Buffer);
				expect(req.json).toBeDefined();
				return ack({ status: 200 });
			});

			await router.handle(createMockRequest("/metadata", { value: "test" }));
		});
	});

	describe("Schema validation with Zod", () => {
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
				schema: zodValidator(paymentSchema),
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
				schema: zodValidator(paymentSchema),
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
				schema: zodValidator(userSchema),
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

		it("should validate complex nested schemas", async () => {
			interface WebhookMap {
				"/order": {
					id: string;
					items: Array<{ sku: string; quantity: number }>;
					customer: { email: string; name: string };
				};
			}

			const router = new WebhookRouter<WebhookMap>();

			const orderSchema = z.object({
				id: z.string(),
				items: z.array(
					z.object({
						sku: z.string(),
						quantity: z.number().int().positive(),
					}),
				),
				customer: z.object({
					email: z.string().email(),
					name: z.string().min(1),
				}),
			});

			router.register("/order", {
				schema: zodValidator(orderSchema),
				handler: async ({ payload, ack }) => {
					expect(payload.items).toHaveLength(2);
					expect(payload.customer.email).toBe("test@example.com");
					return ack({ status: 200 });
				},
			});

			const validOrder = {
				id: "order_123",
				items: [
					{ sku: "WIDGET-1", quantity: 2 },
					{ sku: "GADGET-5", quantity: 1 },
				],
				customer: {
					email: "test@example.com",
					name: "John Doe",
				},
			};

			const response = await router.handle(
				createMockRequest("/order", validOrder),
			);

			expect(response.status).toBe(200);
		});

		it("should transform data with Zod transforms", async () => {
			interface WebhookMap {
				"/data": { value: number };
			}

			const router = new WebhookRouter<WebhookMap>();

			const schema = z.object({
				value: z.string().transform((val) => Number.parseInt(val, 10)),
			});

			router.register("/data", {
				schema: zodValidator(schema),
				handler: async ({ payload, ack }) => {
					expect(typeof payload.value).toBe("number");
					expect(payload.value).toBe(42);
					return ack({ status: 200 });
				},
			});

			const response = await router.handle(
				createMockRequest("/data", { value: "42" }),
			);

			expect(response.status).toBe(200);
		});
	});

	describe("Custom schema validator", () => {
		it("should work with custom schema validator", async () => {
			interface WebhookMap {
				"/custom": { value: number };
			}

			const router = new WebhookRouter<WebhookMap>();

			// Custom validator that ensures value is between 1 and 100
			const customValidator: SchemaValidator<{ value: number }> = {
				validate: (data: unknown) => {
					const obj = data as { value?: unknown };
					if (
						typeof obj.value !== "number" ||
						obj.value < 1 ||
						obj.value > 100
					) {
						return {
							success: false,
							errors: [
								{
									path: ["value"],
									message: "Value must be a number between 1 and 100",
								},
							],
						};
					}
					return {
						success: true,
						data: { value: obj.value },
					};
				},
			};

			router.register("/custom", {
				schema: customValidator,
				handler: async ({ payload, ack }) => {
					expect(payload.value).toBe(50);
					return ack({ status: 200 });
				},
			});

			const validResponse = await router.handle(
				createMockRequest("/custom", { value: 50 }),
			);
			expect(validResponse.status).toBe(200);

			const invalidResponse = await router.handle(
				createMockRequest("/custom", { value: 150 }),
			);
			expect(invalidResponse.status).toBe(400);
			expect(invalidResponse.body).toHaveProperty("error", "validation failed");
		});

		it("should support async validators", async () => {
			interface WebhookMap {
				"/async": { id: string };
			}

			const router = new WebhookRouter<WebhookMap>();

			// Async validator that simulates database check
			const asyncValidator: SchemaValidator<{ id: string }> = {
				validate: async (data: unknown) => {
					const obj = data as { id?: unknown };

					// Simulate async operation
					await new Promise((resolve) => setTimeout(resolve, 10));

					if (typeof obj.id !== "string" || !obj.id.startsWith("valid_")) {
						return {
							success: false,
							errors: [
								{
									path: ["id"],
									message: "ID must start with 'valid_'",
								},
							],
						};
					}

					return {
						success: true,
						data: { id: obj.id },
					};
				},
			};

			router.register("/async", {
				schema: asyncValidator,
				handler: async ({ payload, ack }) => {
					expect(payload.id).toBe("valid_123");
					return ack({ status: 200 });
				},
			});

			const validResponse = await router.handle(
				createMockRequest("/async", { id: "valid_123" }),
			);
			expect(validResponse.status).toBe(200);

			const invalidResponse = await router.handle(
				createMockRequest("/async", { id: "invalid_123" }),
			);
			expect(invalidResponse.status).toBe(400);
		});
	});

	describe("Request verification", () => {
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

		it("should run verify before schema validation", async () => {
			interface WebhookMap {
				"/verified": { value: number };
			}

			const callOrder: string[] = [];

			const router = new WebhookRouter<WebhookMap>({
				verify: async () => {
					callOrder.push("verify");
				},
			});

			const schema = z.object({ value: z.number() });

			router.register("/verified", {
				schema: zodValidator(schema),
				handler: async ({ ack }) => {
					callOrder.push("handler");
					return ack({ status: 200 });
				},
			});

			await router.handle(createMockRequest("/verified", { value: 42 }));

			expect(callOrder).toEqual(["verify", "handler"]);
		});

		it("should support async verify functions", async () => {
			interface WebhookMap {
				"/async-verify": { data: string };
			}

			const router = new WebhookRouter<WebhookMap>({
				verify: async (req) => {
					await new Promise((resolve) => setTimeout(resolve, 10));
					expect(req.path).toBe("/async-verify");
				},
			});

			router.register("/async-verify", async ({ ack }) => {
				return ack({ status: 200 });
			});

			const response = await router.handle(
				createMockRequest("/async-verify", { data: "test" }),
			);

			expect(response.status).toBe(200);
		});
	});

	describe("Response handling", () => {
		it("should support custom status codes", async () => {
			interface WebhookMap {
				"/created": { name: string };
			}

			const router = new WebhookRouter<WebhookMap>();

			router.register("/created", async ({ ack }) => {
				return ack({ status: 201, body: { created: true } });
			});

			const response = await router.handle(
				createMockRequest("/created", { name: "test" }),
			);

			expect(response.status).toBe(201);
			expect(response.body).toEqual({ created: true });
		});

		it("should support custom headers", async () => {
			interface WebhookMap {
				"/headers": { data: string };
			}

			const router = new WebhookRouter<WebhookMap>();

			const customHeaders = new Headers();
			customHeaders.set("X-Custom-Header", "test-value");

			router.register("/headers", async ({ ack }) => {
				return ack({
					status: 200,
					body: "ok",
					headers: customHeaders,
				});
			});

			const response = await router.handle(
				createMockRequest("/headers", { data: "test" }),
			);

			expect(response.status).toBe(200);
			expect(response.headers).toBe(customHeaders);
		});

		it("should handle different body types", async () => {
			interface WebhookMap {
				"/string": { data: string };
				"/object": { data: string };
				"/number": { data: string };
			}

			const router = new WebhookRouter<WebhookMap>();

			router.register("/string", async ({ ack }) => {
				return ack({ status: 200, body: "plain text" });
			});

			router.register("/object", async ({ ack }) => {
				return ack({ status: 200, body: { key: "value" } });
			});

			router.register("/number", async ({ ack }) => {
				return ack({ status: 200, body: 42 });
			});

			const stringResponse = await router.handle(
				createMockRequest("/string", { data: "test" }),
			);
			expect(stringResponse.body).toBe("plain text");

			const objectResponse = await router.handle(
				createMockRequest("/object", { data: "test" }),
			);
			expect(objectResponse.body).toEqual({ key: "value" });

			const numberResponse = await router.handle(
				createMockRequest("/number", { data: "test" }),
			);
			expect(numberResponse.body).toBe(42);
		});
	});

	describe("Error handling", () => {
		it("should handle malformed JSON gracefully", async () => {
			interface WebhookMap {
				"/json": { data: string };
			}

			const router = new WebhookRouter<WebhookMap>();

			router.register("/json", async ({ payload, ack }) => {
				expect(payload).toBeUndefined();
				return ack({ status: 200 });
			});

			const malformedRequest: NormalizedRequest = {
				method: "POST",
				path: "/json",
				headers: new Headers(),
				rawBody: Buffer.from("not valid json{"),
			};

			const response = await router.handle(malformedRequest);
			expect(response.status).toBe(200);
		});

		it("should handle empty request body", async () => {
			interface WebhookMap {
				"/empty": { data?: string };
			}

			const router = new WebhookRouter<WebhookMap>();

			router.register("/empty", async ({ payload, ack }) => {
				expect(payload).toBeUndefined();
				return ack({ status: 200 });
			});

			const emptyRequest: NormalizedRequest = {
				method: "POST",
				path: "/empty",
				headers: new Headers(),
				rawBody: Buffer.from(""),
			};

			const response = await router.handle(emptyRequest);
			expect(response.status).toBe(200);
		});
	});

	describe("Lifecycle hooks", () => {
		describe("Global before hooks", () => {
			it("should execute before hooks before handler", async () => {
				interface WebhookMap {
					"/test": { value: string };
				}

				const callOrder: string[] = [];

				const router = new WebhookRouter<WebhookMap>({
					before: async (req) => {
						callOrder.push("before");
						expect(req.path).toBe("/test");
					},
				});

				router.register("/test", async ({ ack }) => {
					callOrder.push("handler");
					return ack({ status: 200 });
				});

				await router.handle(createMockRequest("/test", { value: "test" }));

				expect(callOrder).toEqual(["before", "handler"]);
			});

			it("should execute multiple before hooks in order", async () => {
				interface WebhookMap {
					"/test": { value: string };
				}

				const callOrder: string[] = [];

				const router = new WebhookRouter<WebhookMap>({
					before: [
						async () => {
							callOrder.push("before-1");
						},
						async () => {
							callOrder.push("before-2");
						},
						async () => {
							callOrder.push("before-3");
						},
					],
				});

				router.register("/test", async ({ ack }) => {
					callOrder.push("handler");
					return ack({ status: 200 });
				});

				await router.handle(createMockRequest("/test", { value: "test" }));

				expect(callOrder).toEqual([
					"before-1",
					"before-2",
					"before-3",
					"handler",
				]);
			});

			it("should allow before hooks to enrich request", async () => {
				interface WebhookMap {
					"/test": { value: string };
				}

				const router = new WebhookRouter<WebhookMap>({
					before: async (req) => {
						(req as { metadata?: { timestamp: number } }).metadata = {
							timestamp: Date.now(),
						};
					},
				});

				router.register("/test", async ({ req, ack }) => {
					expect(
						(req as { metadata?: { timestamp: number } }).metadata,
					).toBeDefined();
					expect(
						typeof (req as { metadata?: { timestamp: number } }).metadata
							?.timestamp,
					).toBe("number");
					return ack({ status: 200 });
				});

				await router.handle(createMockRequest("/test", { value: "test" }));
			});

			it("should stop execution if before hook throws", async () => {
				interface WebhookMap {
					"/test": { value: string };
				}

				let handlerCalled = false;

				const router = new WebhookRouter<WebhookMap>({
					before: async () => {
						throw new Error("Before hook error");
					},
					onError: async (error) => {
						return { status: 400, body: { error: error.message } };
					},
				});

				router.register("/test", async ({ ack }) => {
					handlerCalled = true;
					return ack({ status: 200 });
				});

				const response = await router.handle(
					createMockRequest("/test", { value: "test" }),
				);

				expect(handlerCalled).toBe(false);
				expect(response.status).toBe(400);
				expect(response.body).toEqual({ error: "Before hook error" });
			});
		});

		describe("Global after hooks", () => {
			it("should execute after hooks after handler", async () => {
				interface WebhookMap {
					"/test": { value: string };
				}

				const callOrder: string[] = [];

				const router = new WebhookRouter<WebhookMap>({
					after: async (req, res) => {
						callOrder.push("after");
						expect(req.path).toBe("/test");
						expect(res.status).toBe(200);
					},
				});

				router.register("/test", async ({ ack }) => {
					callOrder.push("handler");
					return ack({ status: 200 });
				});

				await router.handle(createMockRequest("/test", { value: "test" }));

				expect(callOrder).toEqual(["handler", "after"]);
			});

			it("should execute multiple after hooks in order", async () => {
				interface WebhookMap {
					"/test": { value: string };
				}

				const callOrder: string[] = [];

				const router = new WebhookRouter<WebhookMap>({
					after: [
						async () => {
							callOrder.push("after-1");
						},
						async () => {
							callOrder.push("after-2");
						},
						async () => {
							callOrder.push("after-3");
						},
					],
				});

				router.register("/test", async ({ ack }) => {
					callOrder.push("handler");
					return ack({ status: 200 });
				});

				await router.handle(createMockRequest("/test", { value: "test" }));

				expect(callOrder).toEqual(["handler", "after-1", "after-2", "after-3"]);
			});

			it("should receive response in after hooks", async () => {
				interface WebhookMap {
					"/test": { value: string };
				}

				const router = new WebhookRouter<WebhookMap>({
					after: async (_req, res) => {
						expect(res.status).toBe(201);
						expect(res.body).toEqual({ result: "success" });
					},
				});

				router.register("/test", async ({ ack }) => {
					return ack({ status: 201, body: { result: "success" } });
				});

				await router.handle(createMockRequest("/test", { value: "test" }));
			});

			it("should not execute after hooks if handler throws", async () => {
				interface WebhookMap {
					"/test": { value: string };
				}

				let afterCalled = false;

				const router = new WebhookRouter<WebhookMap>({
					after: async () => {
						afterCalled = true;
					},
					onError: async () => {
						return { status: 500, body: { error: "Handler error" } };
					},
				});

				router.register("/test", async () => {
					throw new Error("Handler error");
				});

				await router.handle(createMockRequest("/test", { value: "test" }));

				expect(afterCalled).toBe(false);
			});
		});

		describe("Global onError hook", () => {
			it("should execute onError hook when handler throws", async () => {
				interface WebhookMap {
					"/test": { value: string };
				}

				let errorHookCalled = false;

				const router = new WebhookRouter<WebhookMap>({
					onError: async (error, req) => {
						errorHookCalled = true;
						expect(error.message).toBe("Test error");
						expect(req.path).toBe("/test");
						return { status: 500, body: { error: error.message } };
					},
				});

				router.register("/test", async () => {
					throw new Error("Test error");
				});

				const response = await router.handle(
					createMockRequest("/test", { value: "test" }),
				);

				expect(errorHookCalled).toBe(true);
				expect(response.status).toBe(500);
				expect(response.body).toEqual({ error: "Test error" });
			});

			it("should execute onError hook when verify throws", async () => {
				interface WebhookMap {
					"/test": { value: string };
				}

				let errorHookCalled = false;

				const router = new WebhookRouter<WebhookMap>({
					verify: async () => {
						throw new Error("Verification failed");
					},
					onError: async (error) => {
						errorHookCalled = true;
						expect(error.message).toBe("Verification failed");
						return { status: 401, body: { error: "Unauthorized" } };
					},
				});

				router.register("/test", async ({ ack }) => {
					return ack({ status: 200 });
				});

				const response = await router.handle(
					createMockRequest("/test", { value: "test" }),
				);

				expect(errorHookCalled).toBe(true);
				expect(response.status).toBe(401);
			});

			it("should execute onError hook when before hook throws", async () => {
				interface WebhookMap {
					"/test": { value: string };
				}

				let errorHookCalled = false;

				const router = new WebhookRouter<WebhookMap>({
					before: async () => {
						throw new Error("Before hook error");
					},
					onError: async (error) => {
						errorHookCalled = true;
						return { status: 400, body: { error: error.message } };
					},
				});

				router.register("/test", async ({ ack }) => {
					return ack({ status: 200 });
				});

				const response = await router.handle(
					createMockRequest("/test", { value: "test" }),
				);

				expect(errorHookCalled).toBe(true);
				expect(response.status).toBe(400);
			});

			it("should use default error response if onError returns undefined", async () => {
				interface WebhookMap {
					"/test": { value: string };
				}

				const router = new WebhookRouter<WebhookMap>({
					onError: async () => {
						// Return undefined to use default error response
						return undefined;
					},
				});

				router.register("/test", async () => {
					throw new Error("Custom error");
				});

				const response = await router.handle(
					createMockRequest("/test", { value: "test" }),
				);

				expect(response.status).toBe(500);
				expect(response.body).toEqual({ error: "Custom error" });
			});

			it("should handle different error types", async () => {
				interface WebhookMap {
					"/test": { value: string };
				}

				const router = new WebhookRouter<WebhookMap>({
					onError: async (error) => {
						if (error.message === "Rate limit exceeded") {
							return { status: 429, body: { error: "Too many requests" } };
						}
						if (error.message === "Unauthorized") {
							return { status: 403, body: { error: "Forbidden" } };
						}
						return { status: 500, body: { error: "Internal error" } };
					},
				});

				router.register("/test", async () => {
					throw new Error("Rate limit exceeded");
				});

				const response = await router.handle(
					createMockRequest("/test", { value: "test" }),
				);

				expect(response.status).toBe(429);
				expect(response.body).toEqual({ error: "Too many requests" });
			});
		});

		describe("Route-level hooks", () => {
			it("should execute route-level before hooks after global before hooks", async () => {
				interface WebhookMap {
					"/test": { value: string };
				}

				const callOrder: string[] = [];

				const router = new WebhookRouter<WebhookMap>({
					before: async () => {
						callOrder.push("global-before");
					},
				});

				router.register("/test", {
					before: async () => {
						callOrder.push("route-before");
					},
					handler: async ({ ack }) => {
						callOrder.push("handler");
						return ack({ status: 200 });
					},
				});

				await router.handle(createMockRequest("/test", { value: "test" }));

				expect(callOrder).toEqual(["global-before", "route-before", "handler"]);
			});

			it("should execute route-level after hooks before global after hooks", async () => {
				interface WebhookMap {
					"/test": { value: string };
				}

				const callOrder: string[] = [];

				const router = new WebhookRouter<WebhookMap>({
					after: async () => {
						callOrder.push("global-after");
					},
				});

				router.register("/test", {
					handler: async ({ ack }) => {
						callOrder.push("handler");
						return ack({ status: 200 });
					},
					after: async () => {
						callOrder.push("route-after");
					},
				});

				await router.handle(createMockRequest("/test", { value: "test" }));

				expect(callOrder).toEqual(["handler", "route-after", "global-after"]);
			});

			it("should support multiple route-level hooks", async () => {
				interface WebhookMap {
					"/test": { value: string };
				}

				const callOrder: string[] = [];

				const router = new WebhookRouter<WebhookMap>();

				router.register("/test", {
					before: [
						async () => {
							callOrder.push("route-before-1");
						},
						async () => {
							callOrder.push("route-before-2");
						},
					],
					handler: async ({ ack }) => {
						callOrder.push("handler");
						return ack({ status: 200 });
					},
					after: [
						async () => {
							callOrder.push("route-after-1");
						},
						async () => {
							callOrder.push("route-after-2");
						},
					],
				});

				await router.handle(createMockRequest("/test", { value: "test" }));

				expect(callOrder).toEqual([
					"route-before-1",
					"route-before-2",
					"handler",
					"route-after-1",
					"route-after-2",
				]);
			});

			it("should handle single hook or array of hooks", async () => {
				interface WebhookMap {
					"/single": { value: string };
					"/array": { value: string };
				}

				const callOrder: string[] = [];

				const router = new WebhookRouter<WebhookMap>();

				router.register("/single", {
					before: async () => {
						callOrder.push("single-before");
					},
					handler: async ({ ack }) => {
						return ack({ status: 200 });
					},
					after: async () => {
						callOrder.push("single-after");
					},
				});

				router.register("/array", {
					before: [
						async () => {
							callOrder.push("array-before-1");
						},
						async () => {
							callOrder.push("array-before-2");
						},
					],
					handler: async ({ ack }) => {
						return ack({ status: 200 });
					},
					after: [
						async () => {
							callOrder.push("array-after-1");
						},
						async () => {
							callOrder.push("array-after-2");
						},
					],
				});

				await router.handle(createMockRequest("/single", { value: "test" }));
				await router.handle(createMockRequest("/array", { value: "test" }));

				expect(callOrder).toEqual([
					"single-before",
					"single-after",
					"array-before-1",
					"array-before-2",
					"array-after-1",
					"array-after-2",
				]);
			});
		});

		describe("Complete hook execution order", () => {
			it("should execute all hooks in correct order", async () => {
				interface WebhookMap {
					"/test": { value: string };
				}

				const callOrder: string[] = [];

				const router = new WebhookRouter<WebhookMap>({
					before: [
						async () => {
							callOrder.push("global-before-1");
						},
						async () => {
							callOrder.push("global-before-2");
						},
					],
					verify: async () => {
						callOrder.push("verify");
					},
					after: [
						async () => {
							callOrder.push("global-after-1");
						},
						async () => {
							callOrder.push("global-after-2");
						},
					],
				});

				const schema = z.object({ value: z.string() });

				router.register("/test", {
					before: [
						async () => {
							callOrder.push("route-before-1");
						},
						async () => {
							callOrder.push("route-before-2");
						},
					],
					schema: zodValidator(schema),
					handler: async ({ ack }) => {
						callOrder.push("handler");
						return ack({ status: 200 });
					},
					after: [
						async () => {
							callOrder.push("route-after-1");
						},
						async () => {
							callOrder.push("route-after-2");
						},
					],
				});

				await router.handle(createMockRequest("/test", { value: "test" }));

				expect(callOrder).toEqual([
					"global-before-1",
					"global-before-2",
					"route-before-1",
					"route-before-2",
					"verify",
					"handler",
					"route-after-1",
					"route-after-2",
					"global-after-1",
					"global-after-2",
				]);
			});
		});
	});
});
