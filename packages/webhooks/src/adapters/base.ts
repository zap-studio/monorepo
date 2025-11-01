import type { NormalizedRequest, NormalizedResponse } from "../types";

/** Adapter interface for framework-specific request/response handling */
export interface Adapter {
  /** Convert framework request to the NormalizedRequest (must include raw body)
   * @example
   * ```ts
   * const req = {
   *   body: { foo: "bar" },
   *   headers: { "Content-Type": "application/json" },
   * };
   * const normalizedReq = await adapter.toNormalizedRequest(req);
   * ```
   */
  // biome-ignore lint/suspicious/noExplicitAny: We want to allow any type here because it depends on the framework
  toNormalizedRequest(req: any): Promise<NormalizedRequest>;

  /**
   * Convert NormalizedResponse to the framework response
   *
   * @example
   * ```ts
   * const expressRes = await adapter.toFrameworkResponse(
   *   res,
   *   {
   *     status: 200,
   *     body: { success: true },
   *     headers: { "Content-Type": "application/json" },
   *   }
   * );
   * ```
   */
  // biome-ignore lint/suspicious/noExplicitAny: We want to allow any type here because it depends on the framework
  toFrameworkResponse(frameworkRes: any, res: NormalizedResponse): Promise<any>;

  /**
   * Create a framework-specific route handler for the webhook router
   *
   * @example
   * ```ts
   * import express from "express";
   *
   * const app = express();
   * const router = new WebhookRouter<WebhookMap>();
   *
   * app.post("/webhook/*", express.raw({ type: "application/json" }), adapter.handleWebhook(router));
   * ```
   */
  // biome-ignore lint/suspicious/noExplicitAny: We want to allow any type here because it depends on the framework
  handleWebhook(
    router: {
      handle(req: NormalizedRequest): Promise<NormalizedResponse>;
    }
  ): // biome-ignore lint/suspicious/noExplicitAny: We want to allow any type here because it depends on the framework
  (req: any, res: any) => Promise<void>;
}
